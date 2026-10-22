# Developer & Contribution Guide

This guide details codebase structure, coding conventions, testing practices, and submission guidelines for developers extending **Student Course Hub**.

---

## Codebase Organization

```
student-course-hub/
├── client/                      # React SPA Frontend
│   ├── public/                  # Static assets and index.html
│   ├── src/
│   │   ├── api/                 # Axios client API handlers (axiosClient.js)
│   │   ├── components/          # Reusable UI components (Navbar, LoadingSpinner, etc.)
│   │   ├── context/             # AuthContext state provider
│   │   ├── pages/               # Auth, Admin, Instructor, and Student pages
│   │   ├── App.js / App.css     # Main application layout and routes
│   │   └── index.js             # Client root entry point
│   └── package.json             # NPM dependencies & scripts
│
└── server/                      # Spring Boot REST API Service
    ├── src/main/java/io/khadijah/smartcoursehub/
    │   ├── config/              # Security, CORS, DataInitializer, Exception Handling
    │   ├── controller/          # REST Controllers (/api/auth, /api/admin, etc.)
    │   ├── dto/                 # Request & Response Data Transfer Objects
    │   ├── entity/              # JPA Persistence Entities
    │   ├── repository/          # Spring Data JPA Repositories
    │   ├── security/            # JwtFilter, JwtUtil, UserDetailsService
    │   └── service/             # Business Logic Layer
    └── pom.xml                  # Maven dependencies & build configuration
```

---

## Coding Standards & Conventions

### Java (Backend)
- Use **Lombok** annotations (`@Data`, `@Getter`, `@Setter`, `@Builder`, `@Slf4j`) to avoid boilerplate code.
- Annotate REST Controllers with `@RestController` and `@RequestMapping("/api/...")`.
- Use Spring Security method authorization (`@PreAuthorize("hasRole('ADMIN')")`) where applicable.
- Log via SLAF4J (`log.info(...)`, `log.error(...)`); **do not** use `System.out.println`.

### React (Frontend)
- Build functional components using React Hooks (`useState`, `useEffect`, `useCallback`, `useContext`).
- Handle async API calls cleanly inside `try/catch` blocks with feedback state (`loading`, `error`, `success`).
- Ensure all ESLint warnings are addressed prior to pushing changes (`npm run build` must compile cleanly).

---

## Running Unit & Build Verification

### Backend Tests
```bash
cd server
./mvnw test
```

### Frontend Build & Lint Verification
```bash
cd client
npm run build
```

---

## Branching & Commit Conventions

- **Branches:** Create topic branches formatted as `<category>/<short-description>`  
  *Categories:* `feature/`, `bugfix/`, `docs/`, `refactor/`, `test/`, `chore/`
- **Commits:** Follow [Conventional Commits](https://www.conventionalcommits.org/):
  ```
  <type>(<scope>): <description>
  ```
  *Examples:* `feat(admin): add section capacity update endpoint`, `fix(auth): handle expired jwt token gracefully`.
