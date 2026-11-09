# Standalone defect evidence

### BUG-01 — Unauthorized administrator registration

**Execution:** confirmed on 8 November 2026 using synthetic fixtures in `smartcoursehub_m2_test`.
**Evidence status:** observed defect, unchanged implementation. Severity/priority and fixes below are assessment recommendations, not implemented changes.

**Affected source:** `student-course-hub-master/server/src/main/java/io/khadijah/smartcoursehub/controller/AuthController.java:14,30–34`; `config/SecurityConfig.java:57,61`; `service/AuthService.java:52–76` (all under the same Java package root). Client interface: `student-course-hub-master/client/src/api/axiosClient.js:41–43`. Exact numbered excerpts: SRC-01, SRC-02, SRC-03 and SRC-13.

**Root cause (code inspection):** all `/api/auth/**` routes are public. `register()` accepts the caller's uppercased role, treats ADMIN as valid (lines 59–61), saves that role with `enabled=true` (64–72), and signs a token containing it (74–76). The admin endpoint correctly requires ADMIN, but trusts a privilege the anonymous caller was allowed to acquire. The defect is in privilege provisioning, not evidence that the admin route lacks a role check.

**Preconditions:** backend verified on port 8081; unique synthetic email; no Authorization header for registration. Fresh registration returns a token; archived tokens/passwords cannot be replayed because they are redacted.

**Exact reproduction and actual outcomes:**

1. Anonymous `GET /api/admin/courses` → **403** (negative control).
2. Anonymous `POST /api/auth/register` with the following recorded sanitized body → **200**.

```json
{
  "name": "M2 Synthetic Admin",
  "email": "m2-admin-20261108t135939z-4b2a49@example.test",
  "password": "[REDACTED]",
  "role": "ADMIN"
}
```

3. Relevant registration response fields (real response, credential fields redacted):

```json
{
  "status": 200,
  "body": {
    "success": true,
    "message": "Registration successful",
    "data": {
      "token": "[REDACTED]",
      "userId": 31,
      "name": "M2 Synthetic Admin",
      "email": "m2-admin-20261108t135939z-4b2a49@example.test",
      "role": "ADMIN"
    }
  }
}
```

4. Use the returned token as `Authorization: Bearer <fresh token>` for `GET /api/admin/courses` → **200**, `success=true`. Course-list payload is preserved in the transcript; it is omitted from this excerpt.
5. The synthetic student token receives **403** from the same admin API (negative control).
6. The post-registration SQL query `SELECT id, name, email, role, CAST(enabled AS UNSIGNED) AS enabled FROM users WHERE id=31` returns:

```json
[
  {
    "id": "31",
    "name": "M2 Synthetic Admin",
    "email": "m2-admin-20261108t135939z-4b2a49@example.test",
    "role": "ADMIN",
    "enabled": "1"
  }
]
```

**Expected:** anonymous registration must not create a privileged administrator; reject the privileged role, or enforce the approved public-registration role server-side.
**Actual:** anonymous user 31 obtained an enabled ADMIN account and successfully called a protected administrator endpoint. The registration was a new unique fixture; a separate pre-registration SQL user snapshot was not captured. The 403→200 access comparison and persisted role are the actual evidence.

**Assessment:** Critical severity; P0 priority. Rationale: anonymous privilege escalation across administrative functions. Administrative data alteration is a potential risk; the reproduction only demonstrated admin reads and created synthetic fixtures.

**Recommended future fix:** separate privileged account provisioning from public registration; allow privileged role creation only through an authenticated, authorized administrator workflow. Define the allowed public role policy explicitly, validate it on the server, and test malicious mixed/lowercase roles. Review previously self-created privileged accounts through an approved audit process. No such review/remediation was performed on original data in M2.

**Impact:** authentication service, Spring Security role provisioning, registration/login DTO contracts, React registration API; `users` table and JWT role claims. Future changes must preserve authorized admin provisioning and ordinary student login. Risk: blocking legitimate instructor onboarding or leaving pre-existing improperly provisioned admins unaddressed. Regression tests: anonymous ADMIN denied, student ADMIN denied, case variations denied, permitted student registration succeeds, authorized provisioning succeeds, ordinary login and role controls remain correct. These post-fix expectations are **Not Run**.

**Evidence:** transcript events 0,1,2,5 (zero-based); `bug-01-database.json`; `bug-01-enabled-recheck.json`; E02. The raw MySQL BIT value is U+0001; an initial string comparison incorrectly labeled NOT_REPRODUCED. The corrected numeric cast and original HTTP responses support CONFIRMED. Both classifications remain in the audit trail.
