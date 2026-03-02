# Multi-stage: build JAR inside Docker, then run it.
# Usage: docker compose up --build (no need to run Maven first)

# Stage 1: build the JAR
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build

# Copy Maven wrapper and pom first (better layer caching)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw

# Download dependencies (cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline -B

# Copy source and build
COPY src src
RUN ./mvnw package -DskipTests -B

# Stage 2: run the JAR
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=builder /build/target/coop-backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
