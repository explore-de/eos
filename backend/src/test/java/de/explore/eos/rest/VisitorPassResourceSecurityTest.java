package de.explore.eos.rest;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;

import jakarta.annotation.security.RolesAllowed;

import org.junit.jupiter.api.Test;

class VisitorPassResourceSecurityTest
{
	@Test
	void protectsExportAndVerificationWithTheAdminRole()
	{
		RolesAllowed guard = VisitorPassResource.class.getAnnotation(RolesAllowed.class);

		assertArrayEquals(new String[] { "eos-admin" }, guard.value());
	}
}
