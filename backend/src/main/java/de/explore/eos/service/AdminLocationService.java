package de.explore.eos.service;

import java.util.List;
import java.util.UUID;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import de.explore.eos.entity.AdminLocation;
import de.explore.eos.repository.AdminRepository;
import de.explore.eos.repository.AdminRepository.LocationInUseException;
import de.explore.eos.rest.dto.LocationRequest;
import de.explore.eos.rest.error.ProblemException;

@ApplicationScoped
public class AdminLocationService
{
	@Inject
	AdminRepository repository;

	public List<AdminLocation> list()
	{
		return repository.listLocations();
	}

	public AdminLocation findOrThrow(UUID locationId)
	{
		return repository.findLocation(locationId).orElseThrow(NotFoundException::new);
	}

	public AdminLocation create(LocationRequest request)
	{
		return repository.createLocation(request);
	}

	public AdminLocation update(UUID locationId, LocationRequest request)
	{
		return repository.updateLocation(locationId, request).orElseThrow(NotFoundException::new);
	}

	public void delete(UUID locationId)
	{
		findOrThrow(locationId);
		ensureNotInUse(locationId);
		try
		{
			repository.deleteLocation(locationId);
		}
		catch (LocationInUseException exception)
		{
			throw locationInUse();
		}
	}

	private void ensureNotInUse(UUID locationId)
	{
		if (repository.countVisitsAt(locationId) > 0)
		{
			throw locationInUse();
		}
	}

	private static ProblemException locationInUse()
	{
		return new ProblemException(409, "Location is assigned to one or more visits", List.of());
	}
}
