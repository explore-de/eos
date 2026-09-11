package de.explore.eos.admin;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record AdminVisit(
        UUID id,
        String visitorName,
        String visitorCompany,
        LocalDate visitDate,
        String purpose,
        String hostName,
        String contactInfo,
        VisitStatus status,
        UUID locationId,
        String locationName,
        Instant checkedOutAt,
        Instant createdAt,
        Instant updatedAt) {}
