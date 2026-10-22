# Installation & Setup Guide

This guide provides step-by-step instructions for running **Student Course Hub** locally or in a containerized environment.

---

## System Requirements

| Component | Prerequisite | Recommended Version |
| :--- | :--- | :--- |
| **Java Development Kit (JDK)** | Java 17+ | OpenJDK 17 or Eclipse Temurin 17 |
| **Node.js** | Node 18+ | Node.js v20 LTS / v22 |
| **Package Manager** | npm 9+ | Included with Node.js |
| **Database** | MySQL 8.0+ | MySQL Community Server 8.0 |

---

## 1. Environment Configuration

Copy `.env.example` at the repository root to create your local `.env` configuration file:

```bash
cp .env.example .env
```

### `.env` File Options

```env
# Backend Service Configuration
PORT=8080

# Database Settings
DB_URL=jdbc:mysql://localhost:3306/smartcoursehub_db?createDatabaseIfNotExist=true
DB_USERNAME=root
DB_PASSWORD=your_secure_mysql_password
JPA_DDL_AUTO=update

# JWT Security Credentials
JWT_SECRET=mySecretKeyForJWTTokenGenerationMustBeAtLeast256BitsLongForHS256Algorithm
JWT_EXPIRATION=86400000

# Frontend Configuration
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

---

## 2. Database Initialization

Ensure MySQL server is active on port `3306`. Create the database manually if auto-creation is disabled:

```sql
CREATE DATABASE IF NOT EXISTS smartcoursehub_db;
```

---

## 3. Starting the Backend Server

Navigate to the `/server` directory and launch using the Maven wrapper:

```bash
cd server

# Build executable JAR artifact
./mvnw clean package

# Launch Spring Boot application
./mvnw spring-boot:run
```

The REST API will initialize on `http://localhost:8080`.  
> *Note:* On first startup, `DataInitializer` automatically seeds default admin credentials (`admin@smartcoursehub.com` / `admin123`) and initial course catalog data from `Courses_Processed.csv`.

---

## 4. Starting the Frontend Client

Navigate to the `/client` directory, install node dependencies, and start the React development server:

```bash
cd client

# Install NPM packages
npm install

# Start local dev server
npm start
```

The client SPA will open automatically at `http://localhost:3000`.

---

## Verification & Health Check

Confirm system operation by visiting:
- Backend Health Endpoint: `http://localhost:8080/actuator/health`
- Frontend Web App: `http://localhost:3000/login`
