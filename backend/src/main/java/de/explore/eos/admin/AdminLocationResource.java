package de.explore.eos.admin;

import de.explore.eos.admin.AdminRepository.LocationInUseException;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import java.util.UUID;

@Path("/api/v1/admin/locations")
@RolesAllowed("eos-admin")
@Produces(MediaType.APPLICATION_JSON)
public class AdminLocationResource {
    @Inject
    AdminRepository repository;

    @GET
    public Response list() {
        return noStore(Response.ok(repository.listLocations())).build();
    }

    @GET
    @Path("/{locationId}")
    public Response get(@PathParam("locationId") UUID locationId) {
        return noStore(Response.ok(find(locationId))).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response create(LocationRequest request, @Context UriInfo uriInfo) {
        AdminLocation location = repository.createLocation(AdminApiValidation.validate(request));
        return noStore(Response.created(uriInfo.getAbsolutePathBuilder().path(location.id().toString()).build()))
                .entity(location)
                .build();
    }

    @PUT
    @Path("/{locationId}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response update(@PathParam("locationId") UUID locationId, LocationRequest request) {
        AdminLocation location = repository.updateLocation(locationId, AdminApiValidation.validate(request))
                .orElseThrow(NotFoundException::new);
        return noStore(Response.ok(location)).build();
    }

    @DELETE
    @Path("/{locationId}")
    public Response delete(@PathParam("locationId") UUID locationId) {
        try {
            if (!repository.deleteLocation(locationId)) {
                throw new NotFoundException();
            }
            return Response.noContent().build();
        } catch (LocationInUseException exception) {
            throw new WebApplicationException("Location is assigned to one or more visits", Response.Status.CONFLICT);
        }
    }

    private AdminLocation find(UUID locationId) {
        return repository.findLocation(locationId).orElseThrow(NotFoundException::new);
    }

    private static Response.ResponseBuilder noStore(Response.ResponseBuilder response) {
        return response.header("Cache-Control", "no-store");
    }
}
