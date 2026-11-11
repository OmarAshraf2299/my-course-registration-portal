# Security configuration

The backend requires `DB_PASSWORD` and `JWT_SECRET` in its environment. The tracked
configuration contains no fallback value for either variable. Set `DB_USERNAME`,
`DB_URL`, `PORT`, and `JPA_DDL_AUTO` as needed. Spring Boot does not automatically
load a shell `.env` file; provide these variables through the shell or IDE launch
configuration. Keep private values outside tracked files and command history.

For verification, use only `smartcoursehub_m2_test`, port 8081, and
`JPA_DDL_AUTO=none`. Automated tests use the existing in-memory H2 configuration
and synthetic test JWT key, independently of local MySQL credentials.

Existing local credentials were retained privately in the ignored `.milestone3/`
directory. From the repository root, dot-source `. ./.milestone3/local-env.ps1`
before running the backend from `student-course-hub-master/server` with
`mvn spring-boot:run`. This local helper defaults to the isolated test database
with schema changes disabled. It is not included in Git; other checkouts must
supply their own environment values.

## Credentials requiring rotation

- Rotate the database account password previously stored as the `DB_PASSWORD`
  fallback, wherever that value is still used. Update authorized local/IDE
  configurations at the same time.
- Replace the former `JWT_SECRET` fallback in every deployment using it. Treat
  tokens signed with that key as compromised; replacing the signing key requires
  users to authenticate again.
- The inherited data initializer also contains default passwords for seeded
  accounts. Change those passwords for any existing accounts using them, and
  review privileged accounts created before BUG-01 was fixed.

No credentials or signing keys were rotated by this change. Rotation requires
the owner's approval and coordination to avoid disrupting local applications.

The old defaults remain accessible in prior commits, including the unchanged
GitHub `master` branch. This commit removes defaults from the corrective branch's
current configuration; it does not remove historical exposure. No history was
rewritten and `master` was not modified.

## Verification on 11 November 2026

- `mvn -B -ntp test`: 30 tests passed, zero failures, errors, or skips.
- The backend started on port 8081 using the retained private environment values,
  `smartcoursehub_m2_test`, and `ddl-auto=none`.
- Existing administrator login and a JWT-authenticated administrator course API
  request succeeded. Original-database fingerprints remained unchanged.
- An initial startup check ran before initialization completed; the check passed
  after startup completed. No application change was needed for this retry.
- Private credential files and launch helpers are ignored by Git. Existing local
  changes were backed up; only the two credential-default removals and this
  document belong to the security commit.

Tests ran on the installed Java 21 runtime with the existing Java 17 compilation
target. This check does not claim execution on a Java 17 runtime or React UI tests.
