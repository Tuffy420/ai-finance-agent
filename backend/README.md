# FinPilot AI — Production Backend

Production-ready, scalable backend for **FinPilot AI**, the autonomous personal finance agent.

## 🛠 Tech Stack

* **Language**: Python 3.13
* **Web Framework**: FastAPI (Async)
* **Database**: PostgreSQL with SQLAlchemy 2.0 (asyncpg) + Alembic
* **Cache & Rate Limiting**: Redis 7
* **Task Queue & Scheduler**: Celery + Redis + APScheduler
* **AI & Categorization**: OpenAI (GPT-4o) / Google Gemini API + Heuristic Rule Engine
* **Push Notifications**: Firebase Cloud Messaging (FCM)
* **Export Engines**: ReportLab (PDF), CSV, OpenPyXL (Excel)
* **Security & Auth**: JWT (Access + Refresh Tokens), OAuth2 (Google & Apple), Email OTP, Argon2/Bcrypt, AES-256 Field Encryption

---

## 📁 Directory Structure

```
backend/
├── app/
│   ├── api/v1/          # RESTful versioned endpoints (auth, users, transactions, budgets, analytics, ai, reports)
│   ├── auth/            # JWT, OAuth2, Email OTP, and security dependencies
│   ├── models/          # SQLAlchemy 2.0 database models with UUID, timestamps, and soft delete
│   ├── schemas/         # Pydantic v2 validation schemas
│   ├── repositories/    # Clean Architecture repository pattern
│   ├── services/        # Business logic and domain service layer
│   ├── parser/          # Bank SMS, Android Push Notification, and Email receipt parsers
│   ├── ai/              # AI categorization, chat assistant, and proactive insights
│   ├── analytics/       # Time-series analytics and aggregation calculations
│   ├── notifications/   # Firebase Cloud Messaging service
│   ├── utils/           # ReportLab PDF, CSV, Excel generators, and AES-256 encryption
│   ├── middleware/      # Rate limiter, RFC 7807 error handler, and audit logging
│   ├── config/          # Pydantic BaseSettings and structured logger
│   ├── database/        # Async session manager and database seeder
│   └── main.py          # FastAPI application entrypoint
├── tests/               # Pytest unit and integration test suite
├── Dockerfile           # Multi-stage Python 3.13 image
├── docker-compose.yml   # Multi-container orchestration (API, PostgreSQL, Redis, Celery)
└── requirements.txt     # Locked production dependencies
```

---

## ⚡ Quick Start

### 1. Run with Docker Compose

```bash
cd backend
docker-compose up --build
```

The API will be live at `http://localhost:8000`.
* Interactive Swagger API Docs: `http://localhost:8000/docs`
* ReDoc API Reference: `http://localhost:8000/redoc`

### 2. Run Locally

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.main
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/email-otp/request` | Request 6-digit email OTP |
| `POST` | `/api/v1/auth/email-otp/verify` | Verify OTP & receive JWT token pair |
| `POST` | `/api/v1/auth/oauth/login` | Google / Apple ID token authentication |
| `POST` | `/api/v1/transactions/parse-sms` | Ingest and parse Android bank SMS |
| `POST` | `/api/v1/transactions/parse-notification` | Ingest Android payment push notification |
| `POST` | `/api/v1/transactions/search` | Multi-field search, filtering, and sorting |
| `GET`  | `/api/v1/dashboard/` | Net worth, monthly summary, recent transactions |
| `GET`  | `/api/v1/analytics/monthly` | Monthly income, spending, top categories & merchants |
| `POST` | `/api/v1/ai/chat` | Natural language AI financial queries |
| `GET`  | `/api/v1/ai/insights` | Proactive anomaly detection & savings alerts |
| `GET`  | `/api/v1/reports/pdf` | Download official PDF statement |
| `GET`  | `/api/v1/reports/csv` | Download CSV financial ledger |

---

## 🧪 Testing

Run test suite:

```bash
pytest
```
