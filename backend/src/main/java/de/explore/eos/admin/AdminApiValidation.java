package de.explore.eos.admin;

import java.util.Locale;

import jakarta.ws.rs.BadRequestException;

final class AdminApiValidation
{
	private AdminApiValidation()
	{
	}

	static LocationRequest validate(LocationRequest request)
	{
		if (request == null)
		{
			throw badRequest("A JSON request body is required");
		}
		return new LocationRequest(
			required(request.companyName(), "companyName", 200),
			required(request.street(), "street", 200),
			required(request.postalCode(), "postalCode", 32),
			required(request.city(), "city", 120),
			required(request.country(), "country", 120),
			optional(request.additionalInfo(), "additionalInfo", 1000));
	}

	static VisitRequest validate(VisitRequest request)
	{
		if (request == null)
		{
			throw badRequest("A JSON request body is required");
		}
		if (request.visitDate() == null)
		{
			throw badRequest("visitDate is required");
		}
		if (request.locationId() == null)
		{
			throw badRequest("locationId is required");
		}
		VisitStatus status = request.status() == null ? VisitStatus.REGISTERED : request.status();
		return new VisitRequest(
			required(request.visitorName(), "visitorName", 200),
			optional(request.visitorCompany(), "visitorCompany", 200),
			request.visitDate(),
			required(request.purpose(), "purpose", 500),
			required(request.hostName(), "hostName", 200),
			optional(request.contactInfo(), "contactInfo", 500),
			status,
			request.locationId());
	}

	static VisitStatus parseStatus(String value)
	{
		if (value == null || value.isBlank())
		{
			return null;
		}
		try
		{
			return VisitStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
		}
		catch (IllegalArgumentException exception)
		{
			throw badRequest("status must be REGISTERED, CHECKED_IN, CHECKED_OUT, or CANCELLED");
		}
	}

	static int validateLimit(int limit)
	{
		if (limit < 1 || limit > 200)
		{
			throw badRequest("limit must be between 1 and 200");
		}
		return limit;
	}

	static int validateOffset(int offset)
	{
		if (offset < 0)
		{
			throw badRequest("offset must not be negative");
		}
		return offset;
	}

	private static String required(String value, String field, int maximumLength)
	{
		String normalized = optional(value, field, maximumLength);
		if (normalized == null)
		{
			throw badRequest(field + " is required");
		}
		return normalized;
	}

	private static String optional(String value, String field, int maximumLength)
	{
		if (value == null || value.isBlank())
		{
			return null;
		}
		String normalized = value.trim();
		if (normalized.length() > maximumLength)
		{
			throw badRequest(field + " must not exceed " + maximumLength + " characters");
		}
		return normalized;
	}

	private static BadRequestException badRequest(String message)
	{
		return new BadRequestException(message);
	}
}
