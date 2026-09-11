package de.explore.eos.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import de.explore.eos.api.Text;

public record LocationRequest(
	@NotBlank @Size(max = 200) String companyName,
	@NotBlank @Size(max = 200) String street,
	@NotBlank @Size(max = 32) String postalCode,
	@NotBlank @Size(max = 120) String city,
	@NotBlank @Size(max = 120) String country,
	@Size(max = 1000) String additionalInfo)
{
	public LocationRequest
	{
		companyName = Text.trimToNull(companyName);
		street = Text.trimToNull(street);
		postalCode = Text.trimToNull(postalCode);
		city = Text.trimToNull(city);
		country = Text.trimToNull(country);
		additionalInfo = Text.trimToNull(additionalInfo);
	}
}
