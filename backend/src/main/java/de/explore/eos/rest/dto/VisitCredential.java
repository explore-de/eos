package de.explore.eos.rest.dto;

import de.explore.eos.entity.AdminVisit;

public record VisitCredential(AdminVisit visit, String visitToken)
{
}
