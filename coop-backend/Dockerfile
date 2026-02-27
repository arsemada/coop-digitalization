# Build the JAR on your host first: ./mvnw package -DskipTests
# Then: docker compose up --build

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY target/coop-backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]