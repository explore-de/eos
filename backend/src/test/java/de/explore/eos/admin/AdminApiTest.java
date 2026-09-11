package de.explore.eos.admin;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.notNullValue;

import io.agroal.api.AgroalDataSource;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import jakarta.inject.Inject;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

@QuarkusTest
class AdminApiTest {
    @Inject
    AgroalDataSource dataSource;

    @BeforeEach
    void clearDatabase() throws SQLException {
        try (var connection = dataSource.getConnection(); var statement = connection.createStatement()) {
            statement.executeUpdate("DELETE FROM visits");
            statement.executeUpdate("DELETE FROM locations");
        }
    }

    @Test
    @TestSecurity(user = "admin", roles = "eos-admin")
    void managesLocationsAndVisitsThroughTheAdminApi() {
        String locationId = given()
                .contentType("application/json")
                .body(Map.of(
                        "companyName", "Explore GmbH",
                        "street", "Example Street 1",
                        "postalCode", "10115",
                        "city", "Berlin",
                        "country", "Germany",
                        "additionalInfo", "Reception, second floor"))
                .when()
                .post("/api/v1/admin/locations")
                .then()
                .statusCode(201)
                .header("Cache-Control", "no-store")
                .body("id", notNullValue())
                .extract()
                .path("id");

        String visitId = given()
                .contentType("application/json")
                .body(Map.of(
                        "visitorName", "Ada Lovelace",
                        "visitorCompany", "Analytical Engines Ltd",
                        "visitDate", LocalDate.of(2026, 9, 15).toString(),
                        "purpose", "Project review",
                        "hostName", "Grace Hopper",
                        "contactInfo", "ada@example.test",
                        "locationId", locationId))
                .when()
                .post("/api/v1/admin/visits")
                .then()
                .statusCode(201)
                .body("status", equalTo("REGISTERED"))
                .body("locationName", equalTo("Explore GmbH"))
                .extract()
                .path("id");

        given()
                .queryParam("date", "2026-09-15")
                .queryParam("status", "registered")
                .when()
                .get("/api/v1/admin/visits")
                .then()
                .statusCode(200)
                .body("id", hasItem(visitId));

        given()
                .when()
                .post("/api/v1/admin/visits/{visitId}/check-out", visitId)
                .then()
                .statusCode(200)
                .body("status", equalTo("CHECKED_OUT"))
                .body("checkedOutAt", notNullValue());

        given()
                .when()
                .delete("/api/v1/admin/locations/{locationId}", locationId)
                .then()
                .statusCode(409);

        given()
                .when()
                .delete("/api/v1/admin/visits/{visitId}", visitId)
                .then()
                .statusCode(204);

        given()
                .when()
                .delete("/api/v1/admin/locations/{locationId}", locationId)
                .then()
                .statusCode(204);
    }

    @Test
    @TestSecurity(user = "visitor", roles = "eos-visitor")
    void rejectsNonAdmins() {
        given().when().get("/api/v1/admin/visits").then().statusCode(403);
        given().when().get("/api/v1/admin/locations").then().statusCode(403);
    }
}
