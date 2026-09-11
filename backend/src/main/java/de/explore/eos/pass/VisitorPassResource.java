package de.explore.eos.pass;

import java.net.URI;
import java.util.UUID;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

import de.explore.eos.pass.PassTokenService.InvalidPassTokenException;

@Path("/api/v1/visits/{visitId}/pass")
@RolesAllowed("eos-admin")
public class VisitorPassResource
{
	@Inject
	VisitPassRepository repository;

	@Inject
	PassTokenService tokens;

	@Inject
	VisitorPassPdfGenerator pdfGenerator;

	@GET
	@Produces("application/pdf")
	public Response export(@PathParam("visitId") UUID visitId, @Context UriInfo uriInfo)
	{
		VisitPassData pass = find(visitId);
		String token = tokens.issue(visitId);
		URI verificationUrl = uriInfo.getBaseUriBuilder()
			.path("api/v1/visits/{visitId}/pass/verify")
			.resolveTemplate("visitId", visitId)
			.queryParam("token", token)
			.build();
		byte[] pdf = pdfGenerator.generate(pass, verificationUrl.toASCIIString());

		return Response.ok(pdf, "application/pdf")
			.header("Content-Disposition", "attachment; filename=visitor-pass-" + visitId + ".pdf")
			.header("Cache-Control", "no-store")
			.build();
	}

	@GET
	@Path("/verify")
	@Produces(MediaType.APPLICATION_JSON)
	public Response verify(@PathParam("visitId") UUID visitId, @QueryParam("token") String token)
	{
		try
		{
			tokens.verify(token, visitId);
		}
		catch (InvalidPassTokenException exception)
		{
			throw new BadRequestException(exception.getMessage());
		}
		VisitPassData pass = find(visitId);
		PassVerification verification = new PassVerification(
			true, pass.visitId(), pass.visitorName(), pass.visitDate(), pass.status(), pass.locationName());
		return Response.ok(verification)
			.header("Cache-Control", "no-store")
			.build();
	}

	private VisitPassData find(UUID visitId)
	{
		return repository.findById(visitId).orElseThrow(NotFoundException::new);
	}
}
