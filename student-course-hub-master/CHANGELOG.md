# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-08

### Added
- Monorepo repository layout separating frontend (`/client`) and backend (`/server`).
- JWT-based authentication and role-based authorization for `ADMIN`, `INSTRUCTOR`, and `STUDENT` roles.
- Admin management endpoints for user accounts, courses, and section schedules.
- Instructor portal for section roster viewing, attendance marking, and assignment grading.
- Student portal for course search, section enrollment, submission tracking, and GPA calculation.
- Automated CSV seeding for initial courses and section data.
- Structured technical documentation in `/docs`.

### Changed
- Upgraded Spring Boot parent dependency to version 3.4.1.
- Externalized environment variables for database credentials, JWT secrets, and port bindings.
- Changed JPA DDL configuration to `update` for data persistence.
