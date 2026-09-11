package de.explore.eos.rest.error;

import java.lang.annotation.Annotation;
import java.lang.reflect.Type;
import java.util.Arrays;
import java.util.Locale;
import java.util.stream.Collectors;

import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.ext.ParamConverter;
import jakarta.ws.rs.ext.ParamConverterProvider;
import jakarta.ws.rs.ext.Provider;

import de.explore.eos.util.Text;

@Provider
public class CaseInsensitiveEnumParamConverterProvider implements ParamConverterProvider
{
	@Override
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public <T> ParamConverter<T> getConverter(Class<T> rawType, Type genericType, Annotation[] annotations)
	{
		if (!rawType.isEnum())
		{
			return null;
		}
		return new EnumConverter(rawType, parameterName(annotations));
	}

	private static String parameterName(Annotation[] annotations)
	{
		return Arrays.stream(annotations)
			.filter(QueryParam.class::isInstance)
			.map(annotation -> ((QueryParam)annotation).value())
			.findFirst()
			.orElse("value");
	}

	private record EnumConverter<T extends Enum<T>>(Class<T> type, String parameterName) implements ParamConverter<T>
	{
		@Override
		public T fromString(String value)
		{
			String normalized = Text.trimToNull(value);
			if (normalized == null)
			{
				return null;
			}
			try
			{
				return Enum.valueOf(type, normalized.toUpperCase(Locale.ROOT));
			}
			catch (IllegalArgumentException exception)
			{
				throw ProblemException.invalidParameter(parameterName, "must be one of " + permitted());
			}
		}

		@Override
		public String toString(T value)
		{
			return value == null ? null : value.name();
		}

		private String permitted()
		{
			return Arrays.stream(type.getEnumConstants()).map(Enum::name).collect(Collectors.joining(", "));
		}
	}
}
