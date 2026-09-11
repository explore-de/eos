package de.explore.eos.service;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

import jakarta.enterprise.context.ApplicationScoped;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@ApplicationScoped
public class VisitSessionTokenService
{
	private static final String VERSION = "s1";
	private static final String SEPARATOR_PATTERN = "\\.";
	private static final String UNSIGNED_FORMAT = "%s.%s";
	private static final String TOKEN_FORMAT = "%s.%s.%s";
	private static final String PAYLOAD_FORMAT = "%s:%d";
	private static final char PAYLOAD_SEPARATOR = ':';
	private static final int TOKEN_PART_COUNT = 3;
	private static final int MINIMUM_SECRET_LENGTH = 32;
	private static final String HMAC_ALGORITHM = "HmacSHA256";
	private static final String INVALID_TOKEN = "Invalid visit token";

	@ConfigProperty(name = "eos.visit-session.signing-secret")
	Optional<String> configuredSecret;

	@ConfigProperty(name = "eos.visit-session.ttl", defaultValue = "PT16H")
	Duration timeToLive;

	Clock clock = Clock.systemUTC();

	VisitSessionTokenService()
	{
	}

	VisitSessionTokenService(String secret, Duration timeToLive, Clock clock)
	{
		this.configuredSecret = Optional.of(secret);
		this.timeToLive = timeToLive;
		this.clock = clock;
	}

	public String issue(UUID visitId)
	{
		if (timeToLive.isZero() || timeToLive.isNegative())
		{
			throw new IllegalStateException("eos.visit-session.ttl must be positive");
		}
		String encodedPayload = encodePayload(visitId);
		String unsigned = String.format(UNSIGNED_FORMAT, VERSION, encodedPayload);
		return String.format(TOKEN_FORMAT, VERSION, encodedPayload, sign(unsigned));
	}

	public void verify(String token, UUID expectedVisitId)
	{
		String[] parts = parts(token);
		verifySignature(parts);
		verifyPayload(parts[1], expectedVisitId);
	}

	private String encodePayload(UUID visitId)
	{
		long expiresAt = Instant.now(clock).plus(timeToLive).getEpochSecond();
		String payload = String.format(PAYLOAD_FORMAT, visitId, expiresAt);
		return encode(payload.getBytes(StandardCharsets.UTF_8));
	}

	private static String[] parts(String token)
	{
		if (token == null || token.isBlank())
		{
			throw new InvalidVisitTokenException("Missing visit token");
		}
		String[] parts = token.split(SEPARATOR_PATTERN, -1);
		if (parts.length != TOKEN_PART_COUNT || !VERSION.equals(parts[0]))
		{
			throw new InvalidVisitTokenException(INVALID_TOKEN);
		}
		return parts;
	}

	private void verifySignature(String[] parts)
	{
		String unsigned = String.format(UNSIGNED_FORMAT, parts[0], parts[1]);
		byte[] suppliedSignature;
		byte[] expectedSignature;
		try
		{
			suppliedSignature = decode(parts[2]);
			expectedSignature = decode(sign(unsigned));
		}
		catch (IllegalArgumentException exception)
		{
			throw new InvalidVisitTokenException(INVALID_TOKEN);
		}
		if (!MessageDigest.isEqual(expectedSignature, suppliedSignature))
		{
			throw new InvalidVisitTokenException(INVALID_TOKEN);
		}
	}

	private void verifyPayload(String encodedPayload, UUID expectedVisitId)
	{
		try
		{
			String payload = new String(decode(encodedPayload), StandardCharsets.UTF_8);
			int separator = payload.lastIndexOf(PAYLOAD_SEPARATOR);
			UUID tokenVisitId = UUID.fromString(payload.substring(0, separator));
			long expiresAt = Long.parseLong(payload.substring(separator + 1));
			if (!expectedVisitId.equals(tokenVisitId))
			{
				throw new InvalidVisitTokenException("Visit token does not match this visit");
			}
			if (Instant.now(clock).getEpochSecond() > expiresAt)
			{
				throw new InvalidVisitTokenException("Visit token has expired");
			}
		}
		catch (InvalidVisitTokenException exception)
		{
			throw exception;
		}
		catch (RuntimeException exception)
		{
			throw new InvalidVisitTokenException(INVALID_TOKEN);
		}
	}

	private String sign(String value)
	{
		String secret = configuredSecret.filter(candidate -> candidate.length() >= MINIMUM_SECRET_LENGTH)
			.orElseThrow(() -> new IllegalStateException(
				"eos.visit-session.signing-secret must be at least " + MINIMUM_SECRET_LENGTH + " characters"));
		try
		{
			Mac mac = Mac.getInstance(HMAC_ALGORITHM);
			mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
			return encode(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
		}
		catch (GeneralSecurityException exception)
		{
			throw new IllegalStateException("Could not sign the visit token", exception);
		}
	}

	private static String encode(byte[] value)
	{
		return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
	}

	private static byte[] decode(String value)
	{
		return Base64.getUrlDecoder().decode(value);
	}

	public static class InvalidVisitTokenException extends RuntimeException
	{
		public InvalidVisitTokenException(String message)
		{
			super(message);
		}
	}
}
