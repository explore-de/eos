package de.explore.eos.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import de.explore.eos.entity.AdminVisit;
import de.explore.eos.entity.VisitStatus;
import de.explore.eos.repository.AdminRepository;
import de.explore.eos.repository.AdminRepository.UnknownLocationException;
import de.explore.eos.rest.dto.PublicLocation;
import de.explore.eos.rest.dto.SelfCheckInRequest;
import de.explore.eos.rest.dto.VisitCredential;
import de.explore.eos.rest.dto.VisitRequest;
import de.explore.eos.rest.error.ProblemException;
import de.explore.eos.service.VisitSessionTokenService.InvalidVisitTokenException;

@ApplicationScoped
public class PublicVisitService
{
	private static final String UNKNOWN_HOST = "Empfang";

	@Inject
	AdminRepository repository;

	@Inject
	VisitSessionTokenService tokens;

	public PublicLocation location(UUID locationId)
	{
		return repository.findLocation(locationId)
			.map(location -> new PublicLocation(
				location.id(),
				location.companyName(),
				location.street(),
				location.postalCode(),
				location.city(),
				location.country(),
				location.additionalInfo()))
			.orElseThrow(NotFoundException::new);
	}

	public VisitCredential checkIn(SelfCheckInRequest request)
	{
		location(request.locationId());
		VisitRequest visit = new VisitRequest(
			request.visitorName(),
			request.visitorCompany(),
			LocalDate.now(),
			request.purpose(),
			request.hostName() == null ? UNKNOWN_HOST : request.hostName(),
			request.contactInfo(),
			VisitStatus.CHECKED_IN,
			request.locationId());
		try
		{
			AdminVisit created = repository.createVisit(visit);
			return new VisitCredential(created, tokens.issue(created.id()));
		}
		catch (UnknownLocationException exception)
		{
			throw ProblemException.invalidParameter("locationId", "does not identify an existing location");
		}
	}

	public AdminVisit badge(UUID visitId, String visitToken)
	{
		verify(visitId, visitToken);
		return repository.findVisit(visitId).orElseThrow(NotFoundException::new);
	}

	public AdminVisit checkOut(UUID visitId, String visitToken)
	{
		AdminVisit visit = badge(visitId, visitToken);
		if (visit.status() != VisitStatus.CHECKED_IN)
		{
			throw new ProblemException(409, "This visit is not checked in", List.of());
		}
		return repository.checkOutVisit(visitId).orElseThrow(NotFoundException::new);
	}

	private void verify(UUID visitId, String visitToken)
	{
		try
		{
			tokens.verify(visitToken, visitId);
		}
		catch (InvalidVisitTokenException exception)
		{
			throw new ProblemException(401, exception.getMessage(), List.of());
		}
	}
}
