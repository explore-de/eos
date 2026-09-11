package de.explore.eos.admin;

import de.explore.eos.admin.AdminRepository.UnknownLocationException;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import java.time.LocalDate;
import java.util.UUID;

@Path("/api/v1/admin/visits")
@RolesAllowed("eos-admin")
@Produces(MediaType.APPLICATION_JSON)
public class AdminVisitResource {
    @Inject
    AdminRepository repository;

    @GET
    public Response list(
            @QueryParam("date") LocalDate date,
            @QueryParam("status") String status,
            @QueryParam("locationId") UUID locationId,
            @DefaultValue("50") @QueryParam("limit") int limit,
            @DefaultValue("0") @QueryParam("offset") int offset) {
        var visits = repository.listVisits(
                date,
                AdminApiValidation.parseStatus(status),
                locationId,
                AdminApiValidation.validateLimit(limit),
                AdminApiValidation.validateOffset(offset));
        return noStore(Response.ok(visits)).build();
    }

    @GET
    @Path("/{visitId}")
    public Response get(@PathParam("visitId") UUID visitId) {
        return noStore(Response.ok(find(visitId))).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response create(VisitRequest request, @Context UriInfo uriInfo) {
        try {
            AdminVisit visit = repository.createVisit(AdminApiValidation.validate(request));
            return noStore(Response.created(uriInfo.getAbsolutePathBuilder().path(visit.id().toString()).build()))
                    .entity(visit)
                    .build();
        } catch (UnknownLocationException exception) {
            throw invalidLocation();
        }
    }

    @PUT
    @Path("/{visitId}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response update(@PathParam("visitId") UUID visitId, VisitRequest request) {
        try {
            AdminVisit visit = repository.updateVisit(visitId, AdminApiValidation.validate(request))
                    .orElseThrow(NotFoundException::new);
            return noStore(Response.ok(visit)).build();
        } catch (UnknownLocationException exception) {
            throw invalidLocation();
        }
    }

    @POST
    @Path("/{visitId}/check-out")
    public Response checkOut(@PathParam("visitId") UUID visitId) {
        AdminVisit current = find(visitId);
        if (current.status() == VisitStatus.CANCELLED) {
            throw new WebApplicationException("A cancelled visit cannot be checked out", Response.Status.CONFLICT);
        }
        AdminVisit checkedOut = repository.checkOutVisit(visitId).orElseThrow(NotFoundException::new);
        return noStore(Response.ok(checkedOut)).build();
    }

    @DELETE
    @Path("/{visitId}")
    public Response delete(@PathParam("visitId") UUID visitId) {
        if (!repository.deleteVisit(visitId)) {
            throw new NotFoundException();
        }
        return Response.noContent().build();
    }

    private AdminVisit find(UUID visitId) {
        return repository.findVisit(visitId).orElseThrow(NotFoundException::new);
    }

    private static BadRequestException invalidLocation() {
        return new BadRequestException("locationId does not identify an existing location");
    }

    private static Response.ResponseBuilder noStore(Response.ResponseBuilder response) {
        return response.header("Cache-Control", "no-store");
    }
}
