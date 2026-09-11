# backend

This project uses Quarkus, the Supersonic Subatomic Java Framework.

If you want to learn more about Quarkus, please visit its website: <https://quarkus.io/>.

## Admin API

All admin endpoints require an authenticated principal with the `eos-admin`
role. `GET` responses carrying visitor or location data use `Cache-Control:
no-store`; other methods are not cached by browsers or shared caches in the
first place.

Request bodies and query parameters are checked with Hibernate Validator, so a
rejected request reports **every** violation at once as an RFC 9457 problem
document:

```
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{
  "type": "about:blank",
  "title": "Validation failed",
  "status": 400,
  "errors": [
    { "field": "city", "message": "must not be blank" },
    { "field": "companyName", "message": "size must be between 0 and 200" }
  ]
}
```

The `status` query parameter is matched case-insensitively; an unknown value is
reported the same way, with `field` naming the parameter.

### Locations

- `GET /api/v1/admin/locations`
- `POST /api/v1/admin/locations`
- `GET /api/v1/admin/locations/{locationId}`
- `PUT /api/v1/admin/locations/{locationId}`
- `DELETE /api/v1/admin/locations/{locationId}`

A location cannot be deleted while visits reference it; the API returns `409
Conflict` in that case.

### Visits

- `GET /api/v1/admin/visits` supports optional `date`, `status`, `locationId`,
  `limit`, and `offset` query parameters.
- `POST /api/v1/admin/visits`
- `GET /api/v1/admin/visits/{visitId}`
- `PUT /api/v1/admin/visits/{visitId}`
- `POST /api/v1/admin/visits/{visitId}/check-out`
- `DELETE /api/v1/admin/visits/{visitId}`

Valid visit states are `REGISTERED`, `CHECKED_IN`, `CHECKED_OUT`, and
`CANCELLED`. New visits default to `REGISTERED` when `status` is omitted. The
explicit checkout action is idempotent and records the checkout time. The
Flyway migration creates the `locations` and `visits` tables used by both this
API and the visitor-pass PDF exporter.

## Running the application in dev mode

You can run your application in dev mode that enables live coding using:

```shell script
./mvnw quarkus:dev
```

## Visitor-pass PDF export

The backend exposes the admin-only endpoints below. No frontend behavior is part
of this module.

- `GET /api/v1/visits/{visitId}/pass` exports the PDF.
- `GET /api/v1/visits/{visitId}/pass/verify?token=...` verifies the signed QR
  link and returns the current visit state.

Both endpoints require an authenticated principal with the `eos-admin` role.
Set `EOS_PASS_SIGNING_SECRET` to a random value of at least 32 characters and
map it to `eos.pass.signing-secret` in the deployment configuration. QR tokens
expire after `eos.pass.verification-ttl` (24 hours by default).

`VisitPassRepository` is intentionally read-only and expects the visit/location
columns named in its projection. If the team-owned persistence schema uses
different names, only that projection and its result mapping need adapting; PDF,
token, and HTTP code are isolated from the broader visit implementation.

## Local architecture stack

From the repository root, `docker compose up --build` starts PostgreSQL, the
Keycloak OIDC provider, and the backend. The imported development realm contains
the user `eos-admin` with password `admin-local-only`; these credentials and all
other Compose defaults are for local development only.

The separately owned admin and visitor frontends are declared under the
`frontends` profile without adding frontend code here. Once their images exist,
set `EOS_ADMIN_PANEL_IMAGE` and `EOS_VISITOR_WEB_IMAGE`, then run:

```shell script
docker compose --profile frontends up --build
```

> **_NOTE:_**  Quarkus now ships with a Dev UI, which is available in dev mode only at <http://localhost:8080/q/dev/>.

## Packaging and running the application

The application can be packaged using:

```shell script
./mvnw package
```

It produces the `quarkus-run.jar` file in the `target/quarkus-app/` directory.
Be aware that it’s not an _über-jar_ as the dependencies are copied into the `target/quarkus-app/lib/` directory.

The application is now runnable using `java -jar target/quarkus-app/quarkus-run.jar`.

If you want to build an _über-jar_, execute the following command:

```shell script
./mvnw package -Dquarkus.package.jar.type=uber-jar
```

The application, packaged as an _über-jar_, is now runnable using `java -jar target/*-runner.jar`.

## Creating a native executable

You can create a native executable using:

```shell script
./mvnw package -Dnative
```

Or, if you don't have GraalVM installed, you can run the native executable build in a container using:

```shell script
./mvnw package -Dnative -Dquarkus.native.container-build=true
```

You can then execute your native executable with: `./target/backend-0.1.0-SNAPSHOT-runner`

If you want to learn more about building native executables, please consult <https://quarkus.io/guides/maven-tooling>.

## Related Guides

- REST ([guide](https://quarkus.io/guides/rest)): Build RESTful web services and APIs using Jakarta REST (formerly JAX-RS)
- Flyway ([guide](https://quarkus.io/guides/flyway)): Handle your database schema migrations
- Micrometer Registry Prometheus ([guide](https://quarkus.io/guides/micrometer)): Enable Prometheus support for Micrometer
- SmallRye OpenAPI ([guide](https://quarkus.io/guides/openapi-swaggerui)): Generate OpenAPI schemas and serve Swagger UI for REST API documentation
- REST Jackson ([guide](https://quarkus.io/guides/rest#json-serialisation)): Jackson serialization support for Quarkus REST. This extension is not compatible with the quarkus-resteasy extension, or any of the extensions that depend on it
- Jacoco - Code Coverage ([guide](https://quarkus.io/guides/tests-with-coverage)): Jacoco test coverage support
- Logging JSON ([guide](https://quarkus.io/guides/logging#json-logging)): Add JSON formatter for console logging
- SmallRye Health ([guide](https://quarkus.io/guides/smallrye-health)): Monitor service health
- CycloneDX ([guide](https://quarkus.io/guides/cyclonedx)): Generate application SBOM following CycloneDX specification
- JDBC Driver - PostgreSQL ([guide](https://quarkus.io/guides/datasource)): Connect to the PostgreSQL database via JDBC
