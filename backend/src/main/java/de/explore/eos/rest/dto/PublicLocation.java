package de.explore.eos.rest.dto;

import java.util.UUID;

public record PublicLocation(
	UUID id,
	String companyName,
	String street,
	String postalCode,
	String city,
	String country,
	String additionalInfo)
{
}
