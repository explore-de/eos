package de.explore.eos;

import static io.restassured.RestAssured.given;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

import java.sql.SQLException;
import java.util.Map;

import jakarta.inject.Inject;

import io.agroal.api.AgroalDataSource;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

@QuarkusTest
class PublicVisitApiTest
{
	@Inject
	AgroalDataSource dataSource;

	@BeforeEach
	void clearDatabase() throws SQLException
	{
		try (var connection = dataSource.getConnection(); var statement = connection.createStatement())
		{
			statement.executeUpdate("DELETE FROM visits");
			statement.executeUpdate("DELETE FROM locations");
		}
	}

	@Test
	@TestSecurity(user = "admin", roles = "eos-admin")
	void checksAVisitorInAndLetsThemReadAndEndTheirOwnVisit()
	{
		String locationId = createLocation();

		given()
			.when()
			.get("/api/v1/public/locations/{locationId}", locationId)
			.then()
			.statusCode(200)
			.body("companyName", equalTo("Explore GmbH"))
			.body("street", equalTo("Example Street 1"));

		var credential = given()
			.contentType("application/json")
			.body(Map.of(
				"locationId", locationId,
				"visitorName", "Ada Lovelace",
				"purpose", "Workshop",
				"contactInfo", "ada@example.test",
				"privacyConsent", true))
			.when()
			.post("/api/v1/public/visits")
			.then()
			.statusCode(201)
			.body("visit.status", equalTo("CHECKED_IN"))
			.body("visitToken", notNullValue())
			.extract();

		String visitId = credential.path("visit.id");
		String visitToken = credential.path("visitToken");

		given()
			.header("X-Visit-Token", visitToken)
			.when()
			.get("/api/v1/public/visits/{visitId}", visitId)
			.then()
			.statusCode(200)
			.body("visitorName", equalTo("Ada Lovelace"))
			.body("locationName", equalTo("Explore GmbH"));

		given()
			.header("X-Visit-Token", visitToken)
			.when()
			.post("/api/v1/public/visits/{visitId}/checkout", visitId)
			.then()
			.statusCode(200)
			.body("status", equalTo("CHECKED_OUT"))
			.body("checkedOutAt", notNullValue());

		given()
			.header("X-Visit-Token", visitToken)
			.when()
			.post("/api/v1/public/visits/{visitId}/checkout", visitId)
			.then()
			.statusCode(409);
	}

	@Test
	@TestSecurity(user = "admin", roles = "eos-admin")
	void refusesABadgeWithoutAMatchingToken()
	{
		String locationId = createLocation();
		String visitId = given()
			.contentType("application/json")
			.body(Map.of(
				"locationId", locationId,
				"visitorName", "Alan Turing",
				"purpose", "Workshop",
				"contactInfo", "alan@example.test",
				"privacyConsent", true))
			.when()
			.post("/api/v1/public/visits")
			.then()
			.statusCode(201)
			.extract()
			.path("visit.id");

		given()
			.when()
			.get("/api/v1/public/visits/{visitId}", visitId)
			.then()
			.statusCode(401);

		given()
			.header("X-Visit-Token", "s1.bogus.signature")
			.when()
			.get("/api/v1/public/visits/{visitId}", visitId)
			.then()
			.statusCode(401);
	}

	@Test
	@TestSecurity(user = "admin", roles = "eos-admin")
	void rejectsACheckInWithoutPrivacyConsent()
	{
		String locationId = createLocation();

		given()
			.contentType("application/json")
			.body(Map.of(
				"locationId", locationId,
				"visitorName", "Grace Hopper",
				"purpose", "Workshop",
				"contactInfo", "grace@example.test",
				"privacyConsent", false))
			.when()
			.post("/api/v1/public/visits")
			.then()
			.statusCode(400);
	}

	private static String createLocation()
	{
		return given()
			.contentType("application/json")
			.body(Map.of(
				"companyName", "Explore GmbH",
				"street", "Example Street 1",
				"postalCode", "10115",
				"city", "Berlin",
				"country", "Germany"))
			.when()
			.post("/api/v1/admin/locations")
			.then()
			.statusCode(201)
			.extract()
			.path("id");
	}
}
