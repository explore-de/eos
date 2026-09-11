package de.explore.eos.api;

import java.util.List;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;

public class ProblemException extends WebApplicationException
{
	public ProblemException(int status, String title, List<ProblemError> errors)
	{
		super(Response.status(status)
			.type(Problem.MEDIA_TYPE)
			.entity(Problem.of(status, title, errors))
			.build());
	}

	public static ProblemException invalidParameter(String field, String message)
	{
		return new ProblemException(400, "Validation failed", List.of(new ProblemError(field, message)));
	}
}
