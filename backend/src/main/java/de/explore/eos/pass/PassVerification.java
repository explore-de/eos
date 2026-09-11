package de.explore.eos.pass;

import java.time.LocalDate;
import java.util.UUID;

public record PassVerification(
        boolean valid,
        UUID visitId,
        String visitorName,
        LocalDate visitDate,
        String status,
        String locationName) {}
