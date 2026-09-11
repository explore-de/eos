package de.explore.eos.admin;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import de.explore.eos.api.Text;

public record VisitRequest(
	@NotBlank @Size(max = 200) String visitorName,
	@Size(max = 200) String visitorCompany,
	@NotNull LocalDate visitDate,
	@NotBlank @Size(max = 500) String purpose,
	@NotBlank @Size(max = 200) String hostName,
	@Size(max = 500) String contactInfo,
	VisitStatus status,
	@NotNull UUID locationId)
{
	public VisitRequest
	{
		visitorName = Text.trimToNull(visitorName);
		visitorCompany = Text.trimToNull(visitorCompany);
		purpose = Text.trimToNull(purpose);
		hostName = Text.trimToNull(hostName);
		contactInfo = Text.trimToNull(contactInfo);
		status = status == null ? VisitStatus.REGISTERED : status;
	}
}
