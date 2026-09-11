package de.explore.eos.rest.dto;

import java.util.UUID;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import de.explore.eos.util.Text;

public record SelfCheckInRequest(
	@NotNull UUID locationId,
	@NotBlank @Size(max = 200) String visitorName,
	@Size(max = 200) String visitorCompany,
	@NotBlank @Size(max = 500) String purpose,
	@Size(max = 200) String hostName,
	@NotBlank @Size(max = 500) String contactInfo,
	@AssertTrue(message = "must be accepted") Boolean privacyConsent)
{
	public SelfCheckInRequest
	{
		visitorName = Text.trimToNull(visitorName);
		visitorCompany = Text.trimToNull(visitorCompany);
		purpose = Text.trimToNull(purpose);
		hostName = Text.trimToNull(hostName);
		contactInfo = Text.trimToNull(contactInfo);
	}
}
