package de.explore.eos.rest;

import java.util.UUID;

import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import de.explore.eos.service.PublicVisitService;

@Path("/api/v1/public/locations")
@PermitAll
@Produces(MediaType.APPLICATION_JSON)
public class PublicLocationResource
{
	@Inject
	PublicVisitService visits;

	@GET
	@Path("/{locationId}")
	public Response get(@PathParam("locationId") UUID locationId)
	{
		return Response.ok(visits.location(locationId))
			.header("Cache-Control", "no-store")
			.build();
	}
}
