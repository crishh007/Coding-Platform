<<<<<<< HEAD
# Auth Service (Go)

JWT-based authentication service built with **Gin + GORM + PostgreSQL**.

## Features
- Register / Login with JWT access and refresh tokens
- Secure password reset with time-limited tokens
- Role-based access control (user / admin)
- Rate limiting on all auth endpoints
- Swagger UI for API documentation

## Setup

### 1. Clone the repository
```bash
git clone <repo-url>
cd auth_service
```

### 2. Create your .env file
```bash
cp .env.example .env
```
Open `.env` and fill in your real database credentials and JWT secret.

Generate a strong JWT secret:
```bash
openssl rand -base64 64
```

### 3. Run the service
```bash
cd cmd
go run main.go
```

### 4. Open API docs
```
http://localhost:8000/swagger/index.html
```

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| DB_HOST | Postgres host | localhost |
| DB_PORT | Postgres port | 5432 |
| DB_USER | Postgres user | postgres |
| DB_PASSWORD | Postgres password | — |
| DB_NAME | Database name | auth_db |
| JWT_SECRET | Signing secret (min 256-bit) | — |
| JWT_EXPIRATION | Token TTL in seconds | 3600 |

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /register | Register new user | No |
| POST | /login | Login and get tokens | No |
| POST | /refresh | Get new access token | No |
| POST | /forgot-password | Request reset token | No |
| POST | /reset-password | Reset password | No |
| GET | /api/me | Get profile | Yes |
| PUT | /api/me | Update profile | Yes |
| PUT | /api/change-password | Change password | Yes |
| DELETE | /api/me | Delete account | Yes |
| GET | /admin/dashboard | Admin dashboard | Admin only |

## Project Structure
```
auth_service_go/
├── cmd/          — entry point (main.go)
├── config/       — environment loader
├── controllers/  — request handlers
├── database/     — DB connection
├── docs/         — auto-generated Swagger docs
├── middleware/   — auth, admin, rate limiter
├── models/       — data models and input structs
├── routes/       — route definitions
└── utils/        — JWT and password helpers
```
=======
# Coding-Platform
>>>>>>> fa81e1f3af1a276bb52b14cdc9a3d5bc8fee7291
