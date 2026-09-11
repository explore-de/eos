package de.explore.eos.pass;

import java.time.LocalDate;
import java.util.UUID;

/** Read-only projection containing only the data printed on a visitor pass. */
public record VisitPassData(
	UUID visitId,
	String visitorName,
	String visitorCompany,
	LocalDate visitDate,
	String purpose,
	String hostName,
	String status,
	String locationName,
	String street,
	String postalCode,
	String city,
	String country,
	String locationAdditionalInfo)
{
}
