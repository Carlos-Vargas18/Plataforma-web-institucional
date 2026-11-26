FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn -B -ntp -DskipTests package && cp target/educonnect-backend-*.jar /educonnect.jar

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /educonnect.jar .
USER 10001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/educonnect.jar"]
