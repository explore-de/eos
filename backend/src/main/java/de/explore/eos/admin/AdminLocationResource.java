package de.explore.eos.admin;

import java.net.URI;
import java.util.UUID;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
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

@Path("/api/v1/admin/locations")
@RolesAllowed("eos-admin")
@Produces(MediaType.APPLICATION_JSON)
public class AdminLocationResource
{
	@Inject
	AdminLocationService locations;

	@GET
	public Response list()
	{
		return noStore(Response.ok(locations.list())).build();
	}

	@GET
	@Path("/{locationId}")
	public Response get(@PathParam("locationId") UUID locationId)
	{
		return noStore(Response.ok(locations.findOrThrow(locationId))).build();
	}

	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response create(@Valid @NotNull LocationRequest request, @Context UriInfo uriInfo)
	{
		AdminLocation location = locations.create(request);
		return Response.created(locationUri(uriInfo, location.id())).entity(location).build();
	}

	@PUT
	@Path("/{locationId}")
	@Consumes(MediaType.APPLICATION_JSON)
	public Response update(@PathParam("locationId") UUID locationId, @Valid @NotNull LocationRequest request)
	{
		return Response.ok(locations.update(locationId, request)).build();
	}

	@DELETE
	@Path("/{locationId}")
	public Response delete(@PathParam("locationId") UUID locationId)
	{
		locations.delete(locationId);
		return Response.noContent().build();
	}

	private static URI locationUri(UriInfo uriInfo, UUID locationId)
	{
		return uriInfo.getAbsolutePathBuilder().path(locationId.toString()).build();
	}

	private static Response.ResponseBuilder noStore(Response.ResponseBuilder response)
	{
		return response.header("Cache-Control", "no-store");
	}
}
