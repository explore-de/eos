package de.explore.eos.pass;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;
import java.util.UUID;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import io.agroal.api.AgroalDataSource;

@ApplicationScoped
public class VisitPassRepository
{
	private static final String FIND_PASS = """
		SELECT v.id, v.visitor_name, v.visitor_company, v.visit_date, v.purpose,
		       v.host_name, v.status, l.company_name AS location_name,
		       l.street, l.postal_code, l.city, l.country, l.additional_info
		  FROM visits v
		  JOIN locations l ON l.id = v.location_id
		 WHERE v.id = ?
		""";

	@Inject
	AgroalDataSource dataSource;

	public Optional<VisitPassData> findById(UUID visitId)
	{
		try (var connection = dataSource.getConnection();
			PreparedStatement statement = connection.prepareStatement(FIND_PASS))
		{
			statement.setObject(1, visitId);
			try (ResultSet result = statement.executeQuery())
			{
				if (!result.next())
				{
					return Optional.empty();
				}
				return Optional.of(new VisitPassData(
					result.getObject("id", UUID.class),
					result.getString("visitor_name"),
					result.getString("visitor_company"),
					result.getObject("visit_date", java.time.LocalDate.class),
					result.getString("purpose"),
					result.getString("host_name"),
					result.getString("status"),
					result.getString("location_name"),
					result.getString("street"),
					result.getString("postal_code"),
					result.getString("city"),
					result.getString("country"),
					result.getString("additional_info")));
			}
		}
		catch (SQLException exception)
		{
			throw new IllegalStateException("Could not load visitor-pass data", exception);
		}
	}
}
