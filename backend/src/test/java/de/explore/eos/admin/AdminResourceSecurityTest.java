package de.explore.eos.admin;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;

import jakarta.annotation.security.RolesAllowed;
import org.junit.jupiter.api.Test;

class AdminResourceSecurityTest {
    @Test
    void protectsEveryAdminResourceWithTheAdminRole() {
        assertAdminOnly(AdminVisitResource.class);
        assertAdminOnly(AdminLocationResource.class);
    }

    private static void assertAdminOnly(Class<?> resource) {
        RolesAllowed guard = resource.getAnnotation(RolesAllowed.class);
        assertArrayEquals(new String[] {"eos-admin"}, guard.value());
    }
}
