# Bangladesh Global Newspaper

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.12-blue.svg)
![React](https://img.shields.io/badge/react-18-61DAFB.svg?logo=react)
![Flask](https://img.shields.io/badge/flask-3.0-black.svg?logo=flask)
![MongoDB](https://img.shields.io/badge/mongodb-7-47A248.svg?logo=mongodb)

A full-stack digital newspaper platform with a React/Vite frontend and a Flask/Python backend. It supports a multi-role newsroom workflow, AI-powered translation and transcription, live coverage, multilingual content, and advertisement management — all in one deployable package.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Docker Setup](#docker-setup)
- [User Roles](#user-roles)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment (Render)](#deployment-render)
- [License](#license)

---

## Features

| Category | Details |
|---|---|
| **Role System** | 4-tier hierarchy: Owner → Publisher → Editor → Reporter |
| **Access Control** | Invitation-only newsroom — no public self-registration |
| **Article Lifecycle** | Draft → Submit → Review → Approve → Publish |
| **AI Translation** | Multilingual reporter submissions auto-translated to English via OpenAI GPT-4o-mini |
| **AI Transcription** | Audio/voice reports transcribed via OpenAI Whisper-1 |
| **Live Coverage** | Real-time text updates + embedded video stream support |
| **Advertisements** | Full ad management with live click and impression tracking |
| **Multilingual UI** | Content in Bengali, English, Arabic, Hindi, and Urdu |
| **Media Library** | Centralized file upload and management |
| **Homepage Curation** | Breaking News ticker, Featured articles, Editor's Pick sections |
| **Notifications** | In-app notification system for newsroom staff |
| **Comments** | Reader comment system on published articles |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, React Router v6, Tailwind CSS, Zustand, React Query |
| **Rich Text** | CKEditor 5 |
| **Backend** | Python 3.12, Flask 3.0 |
| **Database** | MongoDB 7 (PyMongo 4.6) |
| **Authentication** | JWT (access + refresh tokens), bcrypt |
| **AI** | OpenAI GPT-4o-mini (translation), Whisper-1 (transcription) |
| **Email** | Flask-Mail (SMTP — Gmail or Resend) |
| **Validation** | Marshmallow |
| **Deployment** | Docker / Docker Compose, Render |

---

## Project Structure

```
bangladesh-global-newspaper/
├── backend/                  # Flask REST API
│   ├── app/
│   │   ├── controllers/      # Route handler logic
│   │   ├── models/           # MongoDB document models
│   │   ├── routes/           # URL blueprints
│   │   ├── services/         # Business logic & AI services
│   │   ├── middleware/        # Auth & permission middleware
│   │   ├── validators/        # Marshmallow schemas
│   │   └── utils/            # Helpers & utilities
│   ├── tests/                # Pytest test suite
│   ├── requirements.txt
│   ├── run.py                # Dev server entry point
│   └── wsgi.py               # Production WSGI entry point
├── frontend/                 # React + Vite SPA
│   └── src/
│       ├── pages/            # Page components
│       ├── components/       # Reusable UI components
│       ├── layouts/          # Shared layout wrappers
│       ├── routes/           # Route definitions & guards
│       ├── services/         # Axios API calls
│       ├── context/          # React context providers
│       └── hooks/            # Custom React hooks
├── scripts/                  # CLI utilities (seed, create owner, etc.)
├── database/                 # Schema docs & seed data
├── docs/                     # Extended project documentation
├── docker-compose.yml
└── render.yaml
```

---

## Prerequisites

- [Conda (Miniconda)](https://docs.anaconda.com/miniconda/) — for the Python virtual environment
- [Node.js 18+](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally **or** a [MongoDB Atlas](https://cloud.mongodb.com/) connection string
- [OpenAI API Key](https://platform.openai.com/) — required for translation and transcription features

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/bangladesh-global-newspaper.git
cd bangladesh-global-newspaper
```

### 2. Backend setup

```bash
# Create and activate the Conda environment
conda create -n venv_news python=3.12
conda activate venv_news

# Install Python dependencies
cd backend
pip install -r requirements.txt
```

### 3. Configure environment variables

Create `backend/.env` (copy from the example below and fill in your values):

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/bangladesh_newspaper

# Flask secrets
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here

# Email (Gmail example)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-gmail-app-password
MAIL_DEFAULT_SENDER=your-gmail@gmail.com

# OpenAI
OPENAI_API_KEY=sk-...

# Frontend origin (for CORS)
FRONTEND_URL=http://localhost:5173

# File uploads
UPLOAD_FOLDER=app/static/uploads
MAX_CONTENT_LENGTH=16777216
```

> **Gmail app password:** Go to your Google Account → Security → 2-Step Verification → App passwords, and generate a password for "Mail".

### 4. Frontend setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env` with:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 5. Seed the database and create the Owner account

```bash
# From the project root
conda run -n venv_news python scripts/seed_database.py
conda run -n venv_news python scripts/create_owner.py
```

### 6. Run both servers

**Backend** — in one terminal:

```bash
conda activate venv_news
cd backend
python run.py
```

**Frontend** — in a second terminal:

```bash
cd frontend
npm run dev
```

| URL | Purpose |
|---|---|
| `http://localhost:5173` | Public-facing newspaper site |
| `http://localhost:5173/auth/login` | Staff login page |
| `http://localhost:5000/api/` | REST API base |

---

## Docker Setup

The entire stack (MongoDB + Backend + Frontend) can be started with a single command:

```bash
docker compose up --build
```

| Service | Port |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:5000` |
| MongoDB | `localhost:27017` |

> Make sure `backend/.env` exists before running Docker Compose — the backend service reads it via `env_file`.

---

## User Roles

| Role | Responsibilities |
|---|---|
| **Owner** | Full system access: manage users, categories, corners, advertisements, and view activity logs |
| **Publisher** | Review and approve articles, set Breaking News / Featured / Editor's Pick flags, manage live streams |
| **Editor** | Write and submit articles, manage the media library |
| **Reporter** | Submit multilingual reports with media attachments or audio; AI handles translation/transcription |

Access is **invitation-only**. The Owner invites staff members by email; there is no public registration.

---

## API Endpoints

All routes are prefixed with `/api/`.

| Module | Base Path | Description |
|---|---|---|
| Auth | `/api/auth/` | Login, logout, token refresh |
| Users | `/api/users/` | User management |
| Invitations | `/api/invitations/` | Invite and onboard staff |
| Articles | `/api/articles/` | Full article CRUD & lifecycle |
| Reports | `/api/reports/` | Reporter submissions |
| Categories | `/api/categories/` | Manage article categories |
| Corners | `/api/corners/` | Themed content sections |
| Tags | `/api/tags/` | Tag management |
| Ads | `/api/ads/` | Advertisement CRUD + tracking |
| Media | `/api/media/` | File upload & library |
| Live | `/api/live/` | Live streams & live updates |
| Notifications | `/api/notifications/` | In-app notifications |
| Comments | `/api/comments/` | Reader comments |
| Dashboard | `/api/dashboard/` | Analytics & stats |
| Public | `/api/public/` | Unauthenticated public content |
| Translation | `/api/translations/` | AI translation endpoints |

---

## Testing

The backend uses **pytest**. Run the test suite from the project root:

```bash
conda activate venv_news
cd backend
pytest tests/ -v
```

Test files cover: authentication, articles, ads, reports, live coverage, and translation.

---

## Deployment (Render)

The `render.yaml` file provides a ready-to-use Render blueprint for deploying both services.

1. Push the repository to GitHub.
2. In the [Render dashboard](https://render.com), click **New → Blueprint** and connect your GitHub repo.
3. Render will automatically detect `render.yaml` and create two services (`bgn-backend` and `bgn-frontend`).
4. Set the following environment variables manually in the Render dashboard (marked `sync: false` in the YAML):

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `MAIL_PASSWORD` | Resend API key (or SMTP password) |
| `MAIL_DEFAULT_SENDER` | e.g. `news@yourdomain.com` |
| `FRONTEND_URL` | Render URL of the frontend service |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `VITE_API_BASE_URL` | Render URL of the backend service |

`SECRET_KEY` and `JWT_SECRET_KEY` are auto-generated by Render.

---

## License

This project is licensed under the [MIT License](LICENSE).
