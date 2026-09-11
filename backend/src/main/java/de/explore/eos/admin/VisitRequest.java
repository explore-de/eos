package de.explore.eos.admin;

import java.time.LocalDate;
import java.util.UUID;

public record VisitRequest(
	String visitorName,
	String visitorCompany,
	LocalDate visitDate,
	String purpose,
	String hostName,
	String contactInfo,
	VisitStatus status,
	UUID locationId)
{
}
