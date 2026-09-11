package de.explore.eos.admin;

import java.util.List;
import java.util.UUID;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import de.explore.eos.admin.AdminRepository.UnknownLocationException;
import de.explore.eos.api.ProblemException;

@ApplicationScoped
public class AdminVisitService
{
	@Inject
	AdminRepository repository;

	public List<AdminVisit> list(VisitQuery query)
	{
		return repository.listVisits(query.date(), query.status(), query.locationId(), query.limit(), query.offset());
	}

	public AdminVisit findOrThrow(UUID visitId)
	{
		return repository.findVisit(visitId).orElseThrow(NotFoundException::new);
	}

	public AdminVisit create(VisitRequest request)
	{
		ensureLocationExists(request.locationId());
		try
		{
			return repository.createVisit(request);
		}
		catch (UnknownLocationException exception)
		{
			throw unknownLocation();
		}
	}

	public AdminVisit update(UUID visitId, VisitRequest request)
	{
		ensureLocationExists(request.locationId());
		try
		{
			return repository.updateVisit(visitId, request).orElseThrow(NotFoundException::new);
		}
		catch (UnknownLocationException exception)
		{
			throw unknownLocation();
		}
	}

	public AdminVisit checkOut(UUID visitId)
	{
		ensureCheckOutAllowed(findOrThrow(visitId));
		return repository.checkOutVisit(visitId).orElseThrow(NotFoundException::new);
	}

	public void delete(UUID visitId)
	{
		if (!repository.deleteVisit(visitId))
		{
			throw new NotFoundException();
		}
	}

	private static void ensureCheckOutAllowed(AdminVisit visit)
	{
		if (visit.status() == VisitStatus.CANCELLED)
		{
			throw new ProblemException(409, "A cancelled visit cannot be checked out", List.of());
		}
	}

	private void ensureLocationExists(UUID locationId)
	{
		if (repository.findLocation(locationId).isEmpty())
		{
			throw unknownLocation();
		}
	}

	private static ProblemException unknownLocation()
	{
		return ProblemException.invalidParameter("locationId", "does not identify an existing location");
	}
}
