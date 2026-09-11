package de.explore.eos.rest;

import java.net.URI;
import java.util.UUID;

import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

import de.explore.eos.rest.dto.SelfCheckInRequest;
import de.explore.eos.rest.dto.VisitCredential;
import de.explore.eos.service.PublicVisitService;

@Path("/api/v1/public/visits")
@PermitAll
@Produces(MediaType.APPLICATION_JSON)
public class PublicVisitResource
{
	private static final String VISIT_TOKEN_HEADER = "X-Visit-Token";

	@Inject
	PublicVisitService visits;

	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response checkIn(@Valid @NotNull SelfCheckInRequest request, @Context UriInfo uriInfo)
	{
		VisitCredential credential = visits.checkIn(request);
		URI location = uriInfo.getAbsolutePathBuilder().path(credential.visit().id().toString()).build();
		return noStore(Response.created(location)).entity(credential).build();
	}

	@GET
	@Path("/{visitId}")
	public Response badge(
		@PathParam("visitId") UUID visitId,
		@HeaderParam(VISIT_TOKEN_HEADER) String visitToken)
	{
		return noStore(Response.ok(visits.badge(visitId, visitToken))).build();
	}

	@POST
	@Path("/{visitId}/checkout")
	public Response checkOut(
		@PathParam("visitId") UUID visitId,
		@HeaderParam(VISIT_TOKEN_HEADER) String visitToken)
	{
		return noStore(Response.ok(visits.checkOut(visitId, visitToken))).build();
	}

	private static Response.ResponseBuilder noStore(Response.ResponseBuilder response)
	{
		return response.header("Cache-Control", "no-store");
	}
}
