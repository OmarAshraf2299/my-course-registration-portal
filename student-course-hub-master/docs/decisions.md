# Architectural Decision Records (ADRs)

## ADR-001: Monorepo Directory Architecture
- **Status:** Approved
- **Context:** The repository originally had Spring Boot at root with React in a subfolder (`student-course-hub-frontend/`).
- **Decision:** Restructure into a clean `/client` (React) and `/server` (Spring Boot) monorepo structure.
- **Consequences:** Simplifies build automation, project navigation, and aligns with standard portfolio conventions.

## ADR-002: JWT Authentication Strategy
- **Status:** Approved
- **Context:** REST APIs require stateless authentication for multi-role security.
- **Decision:** Implement HMAC-SHA signed JWT tokens passed via Authorization Bearer headers.
- **Consequences:** Eliminates server-side session state, enabling scalable authorization checks.

## ADR-003: Spring Boot 3 Upgrade
- **Status:** Approved
- **Context:** `pom.xml` referenced invalid version `4.0.1`.
- **Decision:** Standardize parent version on Spring Boot `3.4.1`.
- **Consequences:** Ensures compatibility with modern Java 17 and official Spring ecosystem dependencies.
