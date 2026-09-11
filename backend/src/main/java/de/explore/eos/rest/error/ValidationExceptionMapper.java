package de.explore.eos.rest.error;

import java.util.Comparator;
import java.util.List;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class ValidationExceptionMapper implements ExceptionMapper<ConstraintViolationException>
{
	@Override
	public Response toResponse(ConstraintViolationException exception)
	{
		List<ProblemError> errors = exception.getConstraintViolations().stream()
			.map(ValidationExceptionMapper::toError)
			.sorted(Comparator.comparing(ProblemError::field).thenComparing(ProblemError::message))
			.toList();

		return Response.status(Response.Status.BAD_REQUEST)
			.type(Problem.MEDIA_TYPE)
			.entity(Problem.of(400, "Validation failed", errors))
			.build();
	}

	private static ProblemError toError(ConstraintViolation<?> violation)
	{
		return new ProblemError(leafOf(violation.getPropertyPath()), violation.getMessage());
	}

	private static String leafOf(Path path)
	{
		String leaf = null;
		for (Path.Node node : path)
		{
			leaf = node.getName();
		}
		return leaf;
	}
}
