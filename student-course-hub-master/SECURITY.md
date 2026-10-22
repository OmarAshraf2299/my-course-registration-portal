# Security Policy

## Supported Versions

Only the latest release version on the `master` branch is supported for security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within **Student Course Hub**, please report it responsibly rather than opening a public issue.

### Reporting Process
1. Email security reports to `security@smartcoursehub.com` or contact the repository owner ([`sedmugen`](https://github.com/sedmugen)).
2. Include a description of the issue, steps to reproduce, and potential impact.
3. We will acknowledge receipt of your report within 48 hours and provide a timeline for addressing the issue.

### Environmental Security Reminders
- Never commit actual database passwords or production JWT secret keys to source repositories.
- Use `.env` environment variables to inject secrets in production environments.
