# Student Course Hub - Client Application

The frontend client for **Student Course Hub**, built with React 19, React Router v7, Axios, and Bootstrap 5.

## Features
- **Responsive Navigation & Dashboard Layouts:** Tailored user views for Administrators, Instructors, and Students.
- **JWT Auth Context:** Persistent login state with Authorization Bearer header interceptors.
- **Role Guards:** Protected route navigation preventing unauthorized role access.

## Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to set the backend REST API base URL:
```bash
cp .env.example .env
```
Default configuration:
```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

### 3. Available Scripts
- `npm start`: Runs the app in development mode on `http://localhost:3000`.
- `npm run build`: Bundles the app for production in the `build/` directory.
- `npm test`: Launches the test runner.
