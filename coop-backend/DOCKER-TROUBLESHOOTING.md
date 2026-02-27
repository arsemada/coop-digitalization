# Docker and run options

## If Maven fails with `TypeTag :: UNKNOWN` or `ExceptionInInitializerError`

This is a **Lombok + JDK 24** compatibility issue. The project is built for **Java 21** and Lombok does not yet support JDK 24’s compiler internals.

**Fix: use JDK 21 to compile and run.**

- **Maven from command line**  
  Set `JAVA_HOME` to a JDK 21 installation, then run `mvn clean install` / `mvn spring-boot:run`.

  **PowerShell (one-liner, adjust path to your JDK 21):**
  ```powershell
  $env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.x.x-hotspot"
  mvn clean install -DskipTests
  ```

- **IntelliJ IDEA**  
  - **File → Project Structure → Project** – set **Project SDK** to **21**.  
  - **File → Settings → Build, Execution, Deployment → Compiler → Java Compiler** – set **Project bytecode version** to **21** and ensure the `coop-backend` module uses **21**.  
  - **File → Invalidate Caches → Invalidate and Restart** (optional, if the error persists).

After switching to JDK 21, the build should succeed.

---

## If `docker compose up --build` fails with "connection refused"

The error means Docker cannot reach the image registry (Docker Hub via Cloudflare). **Until your network allows that connection, use the [Run without Docker](#run-without-docker-when-pulls-keep-failing) option below.**

Common causes and fixes:

1. **Firewall / antivirus** – Allow Docker Desktop.
2. **VPN** – Try with VPN **off**; some VPNs block registry traffic.
3. **Corporate proxy** – In Docker Desktop: **Settings → Resources → Proxies**, set HTTP/HTTPS proxy and, if needed, bypass for internal hosts.
4. **Docker Desktop** – Restart Docker Desktop; ensure the latest update is installed.

After fixing network, run again:

```bash
docker compose up --build
```

### Try a registry mirror (if your network allows it)

If your ISP or company provides a Docker registry mirror, you can point Docker at it. Docker Desktop: **Settings → Docker Engine** and add or merge:

```json
{
  "registry-mirrors": ["https://your-mirror.example.com"]
}
```

Then apply & restart. (You need a mirror URL that works on your network.)

### Load images from another machine

If you can pull images on another PC (e.g. home vs office, or different network):

**On the machine that can pull:**

```bash
docker pull maven:3.9-eclipse-temurin-21
docker pull eclipse-temurin:21-jre
docker pull postgres:15
docker save maven:3.9-eclipse-temurin-21 eclipse-temurin:21-jre postgres:15 -o coop-images.tar
```

Copy `coop-images.tar` to this PC, then:

```bash
docker load -i coop-images.tar
```

After that, `docker compose up --build` may succeed because the base images are already local.

---

## Run without Docker (when pulls keep failing)

You can run the backend and Postgres locally without building any Docker images.

### 1. Install

- **Java 21** – [Adoptium](https://adoptium.net/) or Oracle JDK 21.
- **Maven 3.9+** – [maven.apache.org](https://maven.apache.org/download.cgi).
- **PostgreSQL 15** – [postgresql.org](https://www.postgresql.org/download/) or use only Postgres in Docker (see below).

### 2. Start Postgres

**Option A – Postgres on the host**

- Create database `coopdb`, user `coop`, password `coop`.
- Listen on port `5432` (or set `SPRING_DATASOURCE_URL` in step 3 to your port).

**Option B – Postgres in Docker (only this image)**

If `postgres:15` pulls successfully:

```bash
docker run -d --name coop_postgres -e POSTGRES_DB=coopdb -e POSTGRES_USER=coop -e POSTGRES_PASSWORD=coop -p 5433:5432 postgres:15
```

Then use host `localhost` and port `5433` in the URL below.

### 3. Run the backend

From the `coop-backend` directory:

**PowerShell:**

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5433/coopdb"
$env:SPRING_DATASOURCE_USERNAME="coop"
$env:SPRING_DATASOURCE_PASSWORD="coop"
$env:SPRING_JPA_HIBERNATE_DDL_AUTO="update"
$env:JWT_SECRET="super-secure-production-secret-key-256-bits"
$env:JWT_EXPIRATION="86400000"
$env:JWT_REFRESH_EXPIRATION="86400000"
mvn spring-boot:run
```

**Cmd:**

```cmd
set SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/coopdb
set SPRING_DATASOURCE_USERNAME=coop
set SPRING_DATASOURCE_PASSWORD=coop
set SPRING_JPA_HIBERNATE_DDL_AUTO=update
set JWT_SECRET=super-secure-production-secret-key-256-bits
set JWT_EXPIRATION=86400000
set JWT_REFRESH_EXPIRATION=86400000
mvn spring-boot:run
```

Use port `5432` if Postgres is local on default port.

API will be at **http://localhost:8080**.
