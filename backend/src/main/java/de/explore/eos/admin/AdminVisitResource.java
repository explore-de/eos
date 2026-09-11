package de.explore.eos.admin;

import java.net.URI;
import java.util.UUID;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.BeanParam;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

@Path("/api/v1/admin/visits")
@RolesAllowed("eos-admin")
@Produces(MediaType.APPLICATION_JSON)
public class AdminVisitResource
{
	@Inject
	AdminVisitService visits;

	@GET
	public Response list(@Valid @BeanParam VisitQuery query)
	{
		return noStore(Response.ok(visits.list(query))).build();
	}

	@GET
	@Path("/{visitId}")
	public Response get(@PathParam("visitId") UUID visitId)
	{
		return noStore(Response.ok(visits.findOrThrow(visitId))).build();
	}

	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response create(@Valid @NotNull VisitRequest request, @Context UriInfo uriInfo)
	{
		AdminVisit visit = visits.create(request);
		return Response.created(visitUri(uriInfo, visit.id())).entity(visit).build();
	}

	@PUT
	@Path("/{visitId}")
	@Consumes(MediaType.APPLICATION_JSON)
	public Response update(@PathParam("visitId") UUID visitId, @Valid @NotNull VisitRequest request)
	{
		return Response.ok(visits.update(visitId, request)).build();
	}

	@POST
	@Path("/{visitId}/check-out")
	public Response checkOut(@PathParam("visitId") UUID visitId)
	{
		return Response.ok(visits.checkOut(visitId)).build();
	}

	@DELETE
	@Path("/{visitId}")
	public Response delete(@PathParam("visitId") UUID visitId)
	{
		visits.delete(visitId);
		return Response.noContent().build();
	}

	private static URI visitUri(UriInfo uriInfo, UUID visitId)
	{
		return uriInfo.getAbsolutePathBuilder().path(visitId.toString()).build();
	}

	private static Response.ResponseBuilder noStore(Response.ResponseBuilder response)
	{
		return response.header("Cache-Control", "no-store");
	}
}
