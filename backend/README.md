# backend

This project uses Quarkus, the Supersonic Subatomic Java Framework.

If you want to learn more about Quarkus, please visit its website: <https://quarkus.io/>.

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
