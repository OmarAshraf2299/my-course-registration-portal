# 4. Non-Functional Requirements (NFR)

## Performance
- Typical API response < 300ms under normal load

## Scalability
- System shall support at least 5,000 concurrent users

## Security
- All API calls (except login/register) require JWT
- Passwords stored as salted hashes (e.g., BCrypt)

## Usability
- Responsive UI (Bootstrap/Tailwind) to run on mobile/laptop

## Maintainability
- Modular packages (controller, service, repository, dto, entity)

## Reliability
- Transactional updates for enrollment, grades, attendance