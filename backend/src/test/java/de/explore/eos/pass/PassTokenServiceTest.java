package de.explore.eos.pass;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import de.explore.eos.pass.PassTokenService.InvalidPassTokenException;

class PassTokenServiceTest
{
	private static final String SECRET = "test-secret-with-at-least-32-characters";
	private static final UUID VISIT_ID = UUID.fromString("6cb075c2-3f53-4ed3-bce8-f79ebcb23991");
	private static final Clock NOW = Clock.fixed(Instant.parse("2026-09-11T09:00:00Z"), ZoneOffset.UTC);

	@Test
	void acceptsAnUntamperedTokenForTheExpectedVisit()
	{
		PassTokenService service = new PassTokenService(SECRET, Duration.ofHours(1), NOW);

		String token = service.issue(VISIT_ID);

		assertDoesNotThrow(() -> service.verify(token, VISIT_ID));
	}

	@Test
	void rejectsTamperingAndAVisitIdMismatch()
	{
		PassTokenService service = new PassTokenService(SECRET, Duration.ofHours(1), NOW);
		String token = service.issue(VISIT_ID);

		assertThrows(InvalidPassTokenException.class, () -> service.verify(token + "x", VISIT_ID));
		assertThrows(InvalidPassTokenException.class, () -> service.verify(token, UUID.randomUUID()));
	}

	@Test
	void rejectsAMissingOrStructurallyBrokenToken()
	{
		// given
		PassTokenService service = new PassTokenService(SECRET, Duration.ofHours(1), NOW);
		String token = service.issue(VISIT_ID);

		// when & then
		assertThrows(InvalidPassTokenException.class, () -> service.verify(null, VISIT_ID));
		assertThrows(InvalidPassTokenException.class, () -> service.verify("", VISIT_ID));
		assertThrows(InvalidPassTokenException.class, () -> service.verify("v1.onlytwo", VISIT_ID));
		assertThrows(InvalidPassTokenException.class, () -> service.verify("v1.a.b.c", VISIT_ID));
		assertThrows(
			InvalidPassTokenException.class,
			() -> service.verify(token.replaceFirst("^v1", "v2"), VISIT_ID));
	}

	@Test
	void rejectsATokenSignedWithADifferentSecret()
	{
		// given
		PassTokenService issuer = new PassTokenService(SECRET, Duration.ofHours(1), NOW);
		PassTokenService verifier = new PassTokenService(
			"another-secret-with-at-least-32-characters", Duration.ofHours(1), NOW);

		// when & then
		assertThrows(InvalidPassTokenException.class, () -> verifier.verify(issuer.issue(VISIT_ID), VISIT_ID));
	}

	@Test
	void refusesToIssueWithoutAPositiveTimeToLive()
	{
		// given
		PassTokenService zero = new PassTokenService(SECRET, Duration.ZERO, NOW);
		PassTokenService negative = new PassTokenService(SECRET, Duration.ofMinutes(-1), NOW);

		// when & then
		assertThrows(IllegalStateException.class, () -> zero.issue(VISIT_ID));
		assertThrows(IllegalStateException.class, () -> negative.issue(VISIT_ID));
	}

	@Test
	void refusesToIssueWithATooShortSecret()
	{
		// given
		PassTokenService service = new PassTokenService("too-short", Duration.ofHours(1), NOW);

		// when & then
		assertThrows(IllegalStateException.class, () -> service.issue(VISIT_ID));
	}

	@Test
	void rejectsAnExpiredToken()
	{
		PassTokenService issuer = new PassTokenService(SECRET, Duration.ofMinutes(5), NOW);
		PassTokenService verifier = new PassTokenService(
			SECRET, Duration.ofMinutes(5), Clock.offset(NOW, Duration.ofMinutes(5)));

		assertThrows(InvalidPassTokenException.class, () -> verifier.verify(issuer.issue(VISIT_ID), VISIT_ID));
	}
}
