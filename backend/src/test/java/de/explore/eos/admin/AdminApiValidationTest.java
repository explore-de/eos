package de.explore.eos.admin;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.ws.rs.BadRequestException;

import org.junit.jupiter.api.Test;

class AdminApiValidationTest
{
	@Test
	void normalizesAValidVisitAndDefaultsItsStatus()
	{
		VisitRequest request = new VisitRequest(
			"  Ada Lovelace  ",
			"  ",
			LocalDate.of(2026, 9, 15),
			"  Project review ",
			" Grace Hopper ",
			null,
			null,
			UUID.randomUUID());

		VisitRequest validated = AdminApiValidation.validate(request);

		assertEquals("Ada Lovelace", validated.visitorName());
		assertNull(validated.visitorCompany());
		assertEquals("Project review", validated.purpose());
		assertEquals(VisitStatus.REGISTERED, validated.status());
	}

	@Test
	void rejectsMissingRequiredVisitData()
	{
		VisitRequest request = new VisitRequest(
			" ", null, LocalDate.now(), "Purpose", "Host", null, VisitStatus.REGISTERED, UUID.randomUUID());

		assertThrows(BadRequestException.class, () -> AdminApiValidation.validate(request));
	}

	@Test
	void parsesStatusCaseInsensitivelyAndBoundsPagination()
	{
		assertEquals(VisitStatus.CHECKED_IN, AdminApiValidation.parseStatus("checked_in"));
		assertThrows(BadRequestException.class, () -> AdminApiValidation.parseStatus("unknown"));
		assertThrows(BadRequestException.class, () -> AdminApiValidation.validateLimit(201));
		assertThrows(BadRequestException.class, () -> AdminApiValidation.validateOffset(-1));
	}
}
