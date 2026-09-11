package de.explore.eos.admin;

import java.util.UUID;

public record AdminLocation(
        UUID id,
        String companyName,
        String street,
        String postalCode,
        String city,
        String country,
        String additionalInfo) {}
