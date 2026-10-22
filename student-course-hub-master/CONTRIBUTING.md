# Contributing to Student Course Hub

Thank you for considering contributing to Student Course Hub!

## Development Guidelines

1. **Monorepo Layout:**
   - Place Spring Boot backend code under `/server`.
   - Place React frontend code under `/client`.

2. **Commit Convention:**
   - Follow Conventional Commits format: `<type>(<scope>): <description>`
   - Approved types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `perf`, `build`, `ci`.
   - Keep messages concise and imperative (e.g. `feat: add student gpa calculation endpoint`).

3. **Pull Request Process:**
   - Create a feature branch matching `<category>/<short-description>`.
   - Ensure all tests pass and code compiles cleanly without warnings before opening a PR.
