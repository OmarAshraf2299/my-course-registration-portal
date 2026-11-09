# BUG-01 ? Unauthorized administrator registration

Severity: Critical. Priority: P0.

## Original defect and reproduction

On baseline commit `47429f43bc5fc6a718191b1fb2516cd69d3b2934`, anonymously POST `/api/auth/register` with a unique synthetic account and role `ADMIN`, then use the returned token to GET `/api/admin/courses`. Both requests returned 200. MySQL confirmed an enabled ADMIN account. Anonymous and student admin requests returned 403. Original M2 observation: 8 November 2026. See [preserved original report](evidence/before/BUG-01_Evidence.md) and [numeric enabled-role evidence](evidence/before/bug-01-enabled-recheck.json).

## Root cause and correction

`AuthService.register()` accepted caller-controlled ADMIN, INSTRUCTOR or STUDENT and signed the persisted role into a JWT. Existing admin route authorization was functioning, but public callers could provision the role it trusted.

Public registration now accepts only case-insensitive STUDENT and persists canonical STUDENT. Other or missing roles are rejected without inserting a user. Existing admin login and administrator-only `/api/admin/users` provisioning remain available for authorized ADMIN/INSTRUCTOR creation. This explicitly moves instructor onboarding to that protected workflow.

Changed files (relative to `student-course-hub-master/server`):

- `src/main/java/io/khadijah/smartcoursehub/service/AuthService.java`
- `src/test/java/io/khadijah/smartcoursehub/AuthSecurityRegressionTest.java`

## Expected behavior and validation

Privileged public role requests must fail and persist no account. Student registration/login must succeed; anonymous and student callers must be denied administrator access; legitimate administrators must retain access and account provisioning.

Focused command: `mvn -B -ntp -Dtest=AuthSecurityRegressionTest test`.

11 tests passed, zero failures/errors/skips. Tests cover role/case variants, missing role, student registration/login, incorrect password, anonymous/student admin denial, existing admin login and privileged provisioning. An initial test run failed because the test used nonexistent `/api/courses`; the test was corrected to the existing `/api/student/sections/available`, then passed. No application change was made for that test URL.

Live API/MySQL verification passed 25 checks, including privileged requests returning 400 with zero matching user rows, student/admin/instructor role controls and authorized provisioning. Evidence: [results](evidence/bug01-20261109T142919Z-84aac5/results.json), [HTTP transcript](evidence/bug01-20261109T142919Z-84aac5/http-transcript.json) and accompanying SQL JSON files. Original database table counts, checksums and schema hashes remained unchanged. Status: Fixed and Verified (application behavior). No previously provisioned accounts were removed or reclassified: review of legacy privileged accounts requires a separate authorized audit.

Commit: see [Git commit ledger](Git_Commits.md).
