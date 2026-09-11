package de.explore.eos.admin;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.QueryParam;

public record VisitQuery(
	@QueryParam("date") LocalDate date,
	@QueryParam("status") VisitStatus status,
	@QueryParam("locationId") UUID locationId,
	@DefaultValue("50") @QueryParam("limit") @Min(1) @Max(200) int limit,
	@DefaultValue("0") @QueryParam("offset") @Min(0) int offset)
{
}
