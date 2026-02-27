# Run coop-backend locally (no Docker build). Requires Java 21, Maven, and Postgres.
# Postgres: use default port 5432 or start with: docker run -d --name coop_postgres -e POSTGRES_DB=coopdb -e POSTGRES_USER=coop -e POSTGRES_PASSWORD=coop -p 5433:5432 postgres:15

$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5433/coopdb"
$env:SPRING_DATASOURCE_USERNAME = "coop"
$env:SPRING_DATASOURCE_PASSWORD = "coop"
$env:SPRING_JPA_HIBERNATE_DDL_AUTO = "update"
$env:JWT_SECRET = "super-secure-production-secret-key-256-bits"
$env:JWT_EXPIRATION = "86400000"
$env:JWT_REFRESH_EXPIRATION = "86400000"

mvn spring-boot:run
