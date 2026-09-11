package de.explore.eos.admin;

public record LocationRequest(
        String companyName,
        String street,
        String postalCode,
        String city,
        String country,
        String additionalInfo) {}
