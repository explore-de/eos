package de.explore.eos.admin;

import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class AdminRepository {
    private static final String LOCATION_COLUMNS =
            "id, company_name, street, postal_code, city, country, additional_info";
    private static final String VISIT_COLUMNS = """
            v.id, v.visitor_name, v.visitor_company, v.visit_date, v.purpose,
            v.host_name, v.contact_info, v.status, v.location_id,
            l.company_name AS location_name, v.checked_out_at, v.created_at, v.updated_at
            """;

    @Inject
    AgroalDataSource dataSource;

    public List<AdminLocation> listLocations() {
        String sql = "SELECT " + LOCATION_COLUMNS + " FROM locations ORDER BY company_name, city, id";
        try (Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql);
                ResultSet result = statement.executeQuery()) {
            List<AdminLocation> locations = new ArrayList<>();
            while (result.next()) {
                locations.add(mapLocation(result));
            }
            return locations;
        } catch (SQLException exception) {
            throw persistenceFailure("list locations", exception);
        }
    }

    public Optional<AdminLocation> findLocation(UUID id) {
        String sql = "SELECT " + LOCATION_COLUMNS + " FROM locations WHERE id = ?";
        try (Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setObject(1, id);
            try (ResultSet result = statement.executeQuery()) {
                return result.next() ? Optional.of(mapLocation(result)) : Optional.empty();
            }
        } catch (SQLException exception) {
            throw persistenceFailure("load location", exception);
        }
    }

    @Transactional
    public AdminLocation createLocation(LocationRequest request) {
        UUID id = UUID.randomUUID();
        String sql = """
                INSERT INTO locations
                    (id, company_name, street, postal_code, city, country, additional_info)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """;
        try (Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            bindLocation(statement, id, request);
            statement.executeUpdate();
            return findLocationUsing(connection, id).orElseThrow();
        } catch (SQLException exception) {
            throw persistenceFailure("create location", exception);
        }
    }

    @Transactional
    public Optional<AdminLocation> updateLocation(UUID id, LocationRequest request) {
        String sql = """
                UPDATE locations
                   SET company_name = ?, street = ?, postal_code = ?, city = ?, country = ?,
                       additional_info = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?
                """;
        try (Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, request.companyName());
            statement.setString(2, request.street());
            statement.setString(3, request.postalCode());
            statement.setString(4, request.city());
            statement.setString(5, request.country());
            setNullableString(statement, 6, request.additionalInfo());
            statement.setObject(7, id);
            if (statement.executeUpdate() == 0) {
                return Optional.empty();
            }
            return findLocationUsing(connection, id);
        } catch (SQLException exception) {
            throw persistenceFailure("update location", exception);
        }
    }

    @Transactional
    public boolean deleteLocation(UUID id) {
        try (Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement("DELETE FROM locations WHERE id = ?")) {
            statement.setObject(1, id);
            return statement.executeUpdate() > 0;
        } catch (SQLException exception) {
            if ("23503".equals(exception.getSQLState())) {
                throw new LocationInUseException();
            }
            throw persistenceFailure("delete location", exception);
        }
    }

    public List<AdminVisit> listVisits(
            LocalDate visitDate, VisitStatus status, UUID locationId, int limit, int offset) {
        StringBuilder sql = new StringBuilder("SELECT ")
                .append(VISIT_COLUMNS)
                .append(" FROM visits v JOIN locations l ON l.id = v.location_id WHERE 1 = 1");
        List<Object> parameters = new ArrayList<>();
        if (visitDate != null) {
            sql.append(" AND v.visit_date = ?");
            parameters.add(visitDate);
        }
        if (status != null) {
            sql.append(" AND v.status = ?");
            parameters.add(status.name());
        }
        if (locationId != null) {
            sql.append(" AND v.location_id = ?");
            parameters.add(locationId);
        }
        sql.append(" ORDER BY v.visit_date DESC, v.created_at DESC, v.id LIMIT ? OFFSET ?");
        parameters.add(limit);
        parameters.add(offset);

        try (Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql.toString())) {
            for (int index = 0; index < parameters.size(); index++) {
                statement.setObject(index + 1, parameters.get(index));
            }
            try (ResultSet result = statement.executeQuery()) {
                List<AdminVisit> visits = new ArrayList<>();
                while (result.next()) {
                    visits.add(mapVisit(result));
                }
                return visits;
            }
        } catch (SQLException exception) {
            throw persistenceFailure("list visits", exception);
        }
    }

    public Optional<AdminVisit> findVisit(UUID id) {
        String sql = "SELECT " + VISIT_COLUMNS
                + " FROM visits v JOIN locations l ON l.id = v.location_id WHERE v.id = ?";
        try (Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setObject(1, id);
            try (ResultSet result = statement.executeQuery()) {
                return result.next() ? Optional.of(mapVisit(result)) : Optional.empty();
            }
        } catch (SQLException exception) {
            throw persistenceFailure("load visit", exception);
        }
    }

    @Transactional
    public AdminVisit createVisit(VisitRequest request) {
        UUID id = UUID.randomUUID();
        Instant checkedOutAt = request.status() == VisitStatus.CHECKED_OUT ? Instant.now() : null;
        String sql = """
                INSERT INTO visits
                    (id, visitor_name, visitor_company, visit_date, purpose, host_name,
                     contact_info, status, location_id, checked_out_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
        try (Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            bindVisit(statement, id, request, checkedOutAt);
            statement.executeUpdate();
            return findVisitUsing(connection, id).orElseThrow();
        } catch (SQLException exception) {
            throw mapVisitWriteFailure("create visit", exception);
        }
    }

    @Transactional
    public Optional<AdminVisit> updateVisit(UUID id, VisitRequest request) {
        Instant checkedOutAt = request.status() == VisitStatus.CHECKED_OUT ? Instant.now() : null;
        String sql = """
                UPDATE visits
                   SET visitor_name = ?, visitor_company = ?, visit_date = ?, purpose = ?,
                       host_name = ?, contact_info = ?, status = ?, location_id = ?,
                       checked_out_at = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?
                """;
        try (Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, request.visitorName());
            setNullableString(statement, 2, request.visitorCompany());
            statement.setObject(3, request.visitDate());
            statement.setString(4, request.purpose());
            statement.setString(5, request.hostName());
            setNullableString(statement, 6, request.contactInfo());
            statement.setString(7, request.status().name());
            statement.setObject(8, request.locationId());
            setNullableInstant(statement, 9, checkedOutAt);
            statement.setObject(10, id);
            if (statement.executeUpdate() == 0) {
                return Optional.empty();
            }
            return findVisitUsing(connection, id);
        } catch (SQLException exception) {
            throw mapVisitWriteFailure("update visit", exception);
        }
    }

    @Transactional
    public Optional<AdminVisit> checkOutVisit(UUID id) {
        String sql = """
                UPDATE visits
                   SET status = 'CHECKED_OUT', checked_out_at = CURRENT_TIMESTAMP,
                       updated_at = CURRENT_TIMESTAMP
                 WHERE id = ? AND status <> 'CHECKED_OUT'
                """;
        try (Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setObject(1, id);
            statement.executeUpdate();
            return findVisitUsing(connection, id);
        } catch (SQLException exception) {
            throw persistenceFailure("check out visit", exception);
        }
    }

    @Transactional
    public boolean deleteVisit(UUID id) {
        try (Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement("DELETE FROM visits WHERE id = ?")) {
            statement.setObject(1, id);
            return statement.executeUpdate() > 0;
        } catch (SQLException exception) {
            throw persistenceFailure("delete visit", exception);
        }
    }

    private Optional<AdminVisit> findVisitUsing(Connection connection, UUID id) throws SQLException {
        String sql = "SELECT " + VISIT_COLUMNS
                + " FROM visits v JOIN locations l ON l.id = v.location_id WHERE v.id = ?";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setObject(1, id);
            try (ResultSet result = statement.executeQuery()) {
                return result.next() ? Optional.of(mapVisit(result)) : Optional.empty();
            }
        }
    }

    private Optional<AdminLocation> findLocationUsing(Connection connection, UUID id) throws SQLException {
        String sql = "SELECT " + LOCATION_COLUMNS + " FROM locations WHERE id = ?";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setObject(1, id);
            try (ResultSet result = statement.executeQuery()) {
                return result.next() ? Optional.of(mapLocation(result)) : Optional.empty();
            }
        }
    }

    private static void bindLocation(PreparedStatement statement, UUID id, LocationRequest request)
            throws SQLException {
        statement.setObject(1, id);
        statement.setString(2, request.companyName());
        statement.setString(3, request.street());
        statement.setString(4, request.postalCode());
        statement.setString(5, request.city());
        statement.setString(6, request.country());
        setNullableString(statement, 7, request.additionalInfo());
    }

    private static void bindVisit(
            PreparedStatement statement, UUID id, VisitRequest request, Instant checkedOutAt) throws SQLException {
        statement.setObject(1, id);
        statement.setString(2, request.visitorName());
        setNullableString(statement, 3, request.visitorCompany());
        statement.setObject(4, request.visitDate());
        statement.setString(5, request.purpose());
        statement.setString(6, request.hostName());
        setNullableString(statement, 7, request.contactInfo());
        statement.setString(8, request.status().name());
        statement.setObject(9, request.locationId());
        setNullableInstant(statement, 10, checkedOutAt);
    }

    private static AdminLocation mapLocation(ResultSet result) throws SQLException {
        return new AdminLocation(
                result.getObject("id", UUID.class),
                result.getString("company_name"),
                result.getString("street"),
                result.getString("postal_code"),
                result.getString("city"),
                result.getString("country"),
                result.getString("additional_info"));
    }

    private static AdminVisit mapVisit(ResultSet result) throws SQLException {
        return new AdminVisit(
                result.getObject("id", UUID.class),
                result.getString("visitor_name"),
                result.getString("visitor_company"),
                result.getObject("visit_date", LocalDate.class),
                result.getString("purpose"),
                result.getString("host_name"),
                result.getString("contact_info"),
                VisitStatus.valueOf(result.getString("status")),
                result.getObject("location_id", UUID.class),
                result.getString("location_name"),
                instant(result, "checked_out_at"),
                instant(result, "created_at"),
                instant(result, "updated_at"));
    }

    private static Instant instant(ResultSet result, String column) throws SQLException {
        var value = result.getTimestamp(column);
        return value == null ? null : value.toInstant();
    }

    private static void setNullableString(PreparedStatement statement, int index, String value)
            throws SQLException {
        if (value == null) {
            statement.setNull(index, Types.VARCHAR);
        } else {
            statement.setString(index, value);
        }
    }

    private static void setNullableInstant(PreparedStatement statement, int index, Instant value)
            throws SQLException {
        if (value == null) {
            statement.setNull(index, Types.TIMESTAMP_WITH_TIMEZONE);
        } else {
            statement.setObject(index, OffsetDateTime.ofInstant(value, ZoneOffset.UTC));
        }
    }

    private static RuntimeException mapVisitWriteFailure(String action, SQLException exception) {
        if ("23503".equals(exception.getSQLState())) {
            return new UnknownLocationException();
        }
        return persistenceFailure(action, exception);
    }

    private static IllegalStateException persistenceFailure(String action, SQLException exception) {
        return new IllegalStateException("Could not " + action, exception);
    }

    public static final class LocationInUseException extends RuntimeException {}

    public static final class UnknownLocationException extends RuntimeException {}
}
