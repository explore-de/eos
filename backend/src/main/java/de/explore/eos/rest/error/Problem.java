package de.explore.eos.rest.error;

import java.net.URI;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record Problem(URI type, String title, int status, String detail, URI instance, List<ProblemError> errors)
{
	public static final String MEDIA_TYPE = "application/problem+json";

	private static final URI BLANK = URI.create("about:blank");

	public static Problem of(int status, String title, List<ProblemError> errors)
	{
		return new Problem(BLANK, title, status, null, null, errors.isEmpty() ? null : errors);
	}
}
