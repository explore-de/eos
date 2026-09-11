package de.explore.eos.pass;

import jakarta.enterprise.context.ApplicationScoped;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class PassTokenService {
    private static final String VERSION = "v1";

    @ConfigProperty(name = "eos.pass.signing-secret")
    Optional<String> configuredSecret;

    @ConfigProperty(name = "eos.pass.verification-ttl", defaultValue = "PT24H")
    Duration timeToLive;

    Clock clock = Clock.systemUTC();

    PassTokenService() {}

    PassTokenService(String secret, Duration timeToLive, Clock clock) {
        this.configuredSecret = Optional.of(secret);
        this.timeToLive = timeToLive;
        this.clock = clock;
    }

    public String issue(UUID visitId) {
        if (timeToLive.isZero() || timeToLive.isNegative()) {
            throw new IllegalStateException("eos.pass.verification-ttl must be positive");
        }
        long expiresAt = Instant.now(clock).plus(timeToLive).getEpochSecond();
        String payload = visitId + ":" + expiresAt;
        String encodedPayload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        String unsigned = VERSION + "." + encodedPayload;
        return unsigned + "." + sign(unsigned);
    }

    public void verify(String token, UUID expectedVisitId) {
        if (token == null) {
            throw new InvalidPassTokenException("Missing pass token");
        }
        String[] parts = token.split("\\.", -1);
        if (parts.length != 3 || !VERSION.equals(parts[0])) {
            throw new InvalidPassTokenException("Invalid pass token");
        }

        String unsigned = parts[0] + "." + parts[1];
        byte[] suppliedSignature;
        byte[] expectedSignature;
        try {
            suppliedSignature = Base64.getUrlDecoder().decode(parts[2]);
            expectedSignature = Base64.getUrlDecoder().decode(sign(unsigned));
        } catch (IllegalArgumentException exception) {
            throw new InvalidPassTokenException("Invalid pass token");
        }
        if (!MessageDigest.isEqual(expectedSignature, suppliedSignature)) {
            throw new InvalidPassTokenException("Invalid pass token");
        }

        try {
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            int separator = payload.lastIndexOf(':');
            UUID tokenVisitId = UUID.fromString(payload.substring(0, separator));
            long expiresAt = Long.parseLong(payload.substring(separator + 1));
            if (!expectedVisitId.equals(tokenVisitId)) {
                throw new InvalidPassTokenException("Pass token does not match this visit");
            }
            if (Instant.now(clock).getEpochSecond() >= expiresAt) {
                throw new InvalidPassTokenException("Pass token has expired");
            }
        } catch (InvalidPassTokenException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new InvalidPassTokenException("Invalid pass token");
        }
    }

    private String sign(String value) {
        String secret = configuredSecret
                .filter(candidate -> candidate.length() >= 32)
                .orElseThrow(() -> new IllegalStateException(
                        "eos.pass.signing-secret must contain at least 32 characters"));
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Could not sign visitor-pass token", exception);
        }
    }

    public static final class InvalidPassTokenException extends RuntimeException {
        InvalidPassTokenException(String message) {
            super(message);
        }
    }
}
