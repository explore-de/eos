package de.explore.eos.admin;

import static io.restassured.RestAssured.given;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;

import org.junit.jupiter.api.Test;

@QuarkusTest
class AdminApiValidationTest
{
	@Test
	@TestSecurity(user = "admin", roles = "eos-admin")
	void reportsEveryMissingLocationFieldInOneResponse()
	{
		// given
		Map<String, Object> empty = Map.of();

		// when & then
		given()
			.contentType("application/json")
			.body(empty)
			.when()
			.post("/api/v1/admin/locations")
			.then()
			.statusCode(400)
			.contentType("application/problem+json")
			.body("status", equalTo(400))
			.body("errors", hasSize(5))
			.body(
				"errors.field",
				containsInAnyOrder("companyName", "street", "postalCode", "city", "country"));
	}

	@Test
	@TestSecurity(user = "admin", roles = "eos-admin")
	void reportsAFieldThatExceedsItsMaximumLength()
	{
		// given
		Map<String, Object> request = new HashMap<>(Map.of(
			"companyName", "x".repeat(201),
			"street", "Example Street 1",
			"postalCode", "10115",
			"city", "Berlin",
			"country", "Germany"));

		// when & then
		given()
			.contentType("application/json")
			.body(request)
			.when()
			.post("/api/v1/admin/locations")
			.then()
			.statusCode(400)
			.contentType("application/problem+json")
			.body("errors", hasSize(1))
			.body("errors[0].field", equalTo("companyName"));
	}

	@Test
	@TestSecurity(user = "admin", roles = "eos-admin")
	void reportsEveryMissingVisitFieldInOneResponse()
	{
		// given
		Map<String, Object> empty = Map.of();

		// when & then
		given()
			.contentType("application/json")
			.body(empty)
			.when()
			.post("/api/v1/admin/visits")
			.then()
			.statusCode(400)
			.contentType("application/problem+json")
			.body(
				"errors.field",
				containsInAnyOrder("visitorName", "visitDate", "purpose", "hostName", "locationId"));
	}

	@Test
	@TestSecurity(user = "admin", roles = "eos-admin")
	void trimsSurroundingWhitespaceAndDefaultsTheStatus()
	{
		// given
		String locationId = createLocation();
		Map<String, Object> request = new HashMap<>(Map.of(
			"visitorName", "  Ada Lovelace  ",
			"visitDate", LocalDate.of(2026, 9, 15).toString(),
			"purpose", "  Project review  ",
			"hostName", "  Grace Hopper  ",
			"locationId", locationId));

		// when & then
		given()
			.contentType("application/json")
			.body(request)
			.when()
			.post("/api/v1/admin/visits")
			.then()
			.statusCode(201)
			.body("visitorName", equalTo("Ada Lovelace"))
			.body("purpose", equalTo("Project review"))
			.body("status", equalTo("REGISTERED"));
	}

	@Test
	@TestSecurity(user = "admin", roles = "eos-admin")
	void rejectsAnUnknownStatusFilterWithAProblemResponse()
	{
		// when & then
		given()
			.queryParam("status", "unknown")
			.when()
			.get("/api/v1/admin/visits")
			.then()
			.statusCode(400)
			.contentType("application/problem+json")
			.body("errors[0].field", equalTo("status"));
	}

	@Test
	@TestSecurity(user = "admin", roles = "eos-admin")
	void keepsAcceptingAStatusFilterInAnyCase()
	{
		// when & then
		given()
			.queryParam("status", "checked_in")
			.when()
			.get("/api/v1/admin/visits")
			.then()
			.statusCode(200);
	}

	@Test
	@TestSecurity(user = "admin", roles = "eos-admin")
	void rejectsPaginationOutsideItsBounds()
	{
		// when & then
		given()
			.queryParam("limit", 201)
			.when()
			.get("/api/v1/admin/visits")
			.then()
			.statusCode(400)
			.contentType("application/problem+json")
			.body("errors[0].field", equalTo("limit"));

		given()
			.queryParam("offset", -1)
			.when()
			.get("/api/v1/admin/visits")
			.then()
			.statusCode(400)
			.contentType("application/problem+json")
			.body("errors[0].field", equalTo("offset"));
	}

	@Test
	@TestSecurity(user = "admin", roles = "eos-admin")
	void reportsAnUnknownLocationAsAFieldError()
	{
		// given
		Map<String, Object> request = new HashMap<>(Map.of(
			"visitorName", "Ada Lovelace",
			"visitDate", LocalDate.of(2026, 9, 15).toString(),
			"purpose", "Project review",
			"hostName", "Grace Hopper",
			"locationId", UUID.randomUUID().toString()));

		// when & then
		given()
			.contentType("application/json")
			.body(request)
			.when()
			.post("/api/v1/admin/visits")
			.then()
			.statusCode(400)
			.contentType("application/problem+json")
			.body("errors[0].field", equalTo("locationId"));
	}

	private String createLocation()
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
