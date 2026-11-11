# Milestone 3 — Corrective Maintenance

Three documented defects were corrected and verified in sequential commits on `milestone3-corrective`. The final Maven suite passed **30 tests**, with zero failures, errors or skips. Live API/MySQL checks passed for each defect and affected regression workflows.

## Baseline and scope

Initial branch: `master`. Baseline commit: `47429f43bc5fc6a718191b1fb2516cd69d3b2934`. The repository and preserved Milestone 2 reports/API/database evidence were inspected before changes. Existing confirmed observations from 8 November 2026 establish the failing baseline; they were not overwritten or recreated to hide data. See [before-evidence provenance](evidence/before/provenance.json) and [initial Git state](evidence/initial-git-state.json).

The work follows the university Milestone 3 requirements: reproduce and document three pre-existing defects; identify causes/files/expected behavior; implement traceable fixes; execute focused and basic regression tests; update the maintenance log; attach before/after evidence. No Waiting List or unrelated enhancement was implemented.

## Corrections and verification

| Bug | Severity / priority | Before | Verified correction | Status |
|---|---|---|---|---|
| [BUG-01](BUG01_Report.md) | Critical / P0 | Anonymous ADMIN registration returned 200, persisted an enabled ADMIN and issued a token that accessed an administrator API with 200. | Restrict public registration to case-insensitive STUDENT and persist canonical STUDENT; retain protected administrator provisioning and existing login. 11 focused automated tests; 25 live checks passed. | Fixed and Verified (application behavior) |
| [BUG-02](BUG02_Report.md) | Medium / P1 | Repeated weekly generation increased session rows 0 to 2 to 4 for the same section/date/start time. | Hold a database write lock on the section, look up section/date/start time, reuse the stable existing row and insert only missing sessions. 6 focused automated tests; 16 live checks passed. | Fixed and Verified (application behavior) |
| [BUG-03](BUG03_Report.md) | High / P1 | Repeated PRESENT marking increased the same student/session pair 0 to 1 to 2 rows; the summary reported two classes for one recorded session. | Lock the session, validate and upsert attendance atomically; update existing status/IDs, deduplicate identical historical statuses in summaries, and require explicit instructor re-mark for conflicts. 12 focused automated tests; 31 live checks passed. | Fixed and Verified (application behavior) |

The standalone defect reports contain reproduction steps, exact causes, changed files, behavior and before/after references. [Test results](Test_Results.md) record expected and actual results; [regression results](Regression_Test_Results.md) cover login, course browsing, enrollment, withdrawal, administrator operations and affected attendance/session behavior. See [commit ledger](Git_Commits.md) for the three code SHAs.

## Safe environment and preservation

API tests used port 8081 and only `smartcoursehub_m2_test` on MySQL. The launcher explicitly sets that JDBC URL and `ddl-auto=none`, binds locally, and verifies the listener PID, Hikari URL and MySQL pool. Automated Maven tests use isolated in-memory H2. [Environment verification](evidence/environment-verification.json) records the observed setup.

The original `smartcoursehub_db` was accessed read-only for table counts, checksums and schema fingerprints. Every live run compares before/after fingerprints and records them unchanged. No original rows were exported, modified or deleted. No destructive migration, schema update or cleanup was performed. Synthetic test fixtures are retained. The complete `.milestone2/` file set and bytes and all eight pre-existing modified/untracked files are checked against initial SHA-256 snapshots; private backups remain in `.milestone3/`. Existing user changes are excluded from fix commits. Final receipts: [preservation verification](evidence/preservation-verification.json), [privacy scan](evidence/privacy-scan.json), [integrity manifest](evidence/integrity-manifest.json).

## Limits and retained historical data

Historical duplicate session and attendance rows remain preserved. Database locks prevent duplicates through every current application writer, including concurrent application instances; no global SQL uniqueness constraint was installed. Direct SQL and future writers bypassing those locks are outside that guarantee. Reconciliation and a constraint migration require a separate approved plan. Historical attendance conflicts are surfaced instead of inventing a latest status; an instructor's explicit re-mark resolves the status while retaining row IDs. Review of previously self-provisioned privileged accounts remains a separate authorized audit.

Public instructor registration is now blocked because instructors are privileged; existing admins provision instructors through the existing protected user API. Existing legitimate admin and instructor authentication was tested. Java 21.0.10 was available and used with the Java 17 compilation target. Execution on an actual Java 17 runtime was **Not Run**. React/browser manual application workflows were **Not Run**; the documented regression checks exercise the backend APIs. Screenshots are authentic browser views of recorded sanitized JSON, not application-UI testing; copied M2 PNGs are rendered evidence excerpts.

An initial auth test used nonexistent `/api/courses` and failed; correcting the test to the existing student sections route produced a passing run. The first BUG-03 live attempt recorded 30 passing checks and one failed test oracle: student marking was denied with the existing HTTP 400 `Access Denied` mapping rather than the expected 403. No unauthorized attendance was written. The harness was corrected to accept either 403 or the exact existing 400 denial with unchanged database rows, then a fresh complete run passed. No product change was made for that response mapping. Two environmental startup attempts required retries before API verification; no defect API run was counted on an unidentified or failed backend. The final verified starts and tests passed. [Test results](Test_Results.md) retain the attempt history. Nothing was pushed to GitHub.


## Verification resumed on 11 November 2026

At this inspection, branch `milestone3-corrective` was at `b65aba91b009674896258756d36927878937c392`, with BUG-01 and BUG-02 already committed and BUG-03 uncommitted. Current local changes were backed up privately before proceeding. The first two corrections were reviewed and reverified in order before BUG-03 was verified and committed. Original initial-state evidence remains preserved. The final runs above are from 11 November 2026.
