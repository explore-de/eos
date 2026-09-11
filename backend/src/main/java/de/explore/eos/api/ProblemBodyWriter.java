package de.explore.eos.api;

import java.io.IOException;
import java.io.OutputStream;
import java.lang.annotation.Annotation;
import java.lang.reflect.Type;

import jakarta.inject.Inject;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.ext.MessageBodyWriter;
import jakarta.ws.rs.ext.Provider;

import com.fasterxml.jackson.databind.ObjectMapper;

@Provider
@Produces(Problem.MEDIA_TYPE)
public class ProblemBodyWriter implements MessageBodyWriter<Problem>
{
	@Inject
	ObjectMapper objectMapper;

	@Override
	public boolean isWriteable(Class<?> type, Type genericType, Annotation[] annotations, MediaType mediaType)
	{
		return Problem.class.isAssignableFrom(type);
	}

	@Override
	public void writeTo(
		Problem problem,
		Class<?> type,
		Type genericType,
		Annotation[] annotations,
		MediaType mediaType,
		MultivaluedMap<String, Object> headers,
		OutputStream entityStream) throws IOException
	{
		objectMapper.writeValue(entityStream, problem);
	}
}
