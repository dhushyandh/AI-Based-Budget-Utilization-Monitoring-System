# Ledgerly — AI-Based Budget Utilization Monitoring System

A full-stack budget and expense monitoring application built with React, Vite, Express, MongoDB, and Mongoose.

## Product capabilities
- Secure registration and login using bcrypt password hashing and JWT sessions.
- User-scoped budget and expense management.
- Budget allocation, utilization, and remaining-balance calculations.
- Dashboard summaries, category breakdowns, and budget performance charts.
- Rule-based spending signals for high utilization and overspending.
- Transaction search, category filtering, and CSV export.
- Responsive workspace interface for desktop and mobile.

> **Transparency:** Spending signals are explainable, deterministic business rules. The project does not currently use a trained ML model or an LLM. The “AI-Based” project title is retained for the internship brief, while the UI accurately describes the current feature as rule-based insights.

## Architecture
See [ARCHITECTURE.md](./ARCHITECTURE.md) for system boundaries, folder responsibilities, data flow, domain rules, and quality gates.

## Repository structure
- `client/` — React + Vite application, organized by product feature.
- `server/` — Express + MongoDB REST API.
- `ARCHITECTURE.md` — architecture and engineering decisions.
- `DEPLOYMENT_GUIDE.md` — deployment topology and environment configuration.

## Local development
Requirements: Node.js 20+ and MongoDB (local or Atlas).

### Backend
1. Copy `server/.env.example` to `server/.env`.
2. Set `MONGO_URI` and a random `JWT_SECRET` (at least 32 characters).
3. Run `cd server && npm install && npm run dev`. API default: `http://localhost:5000/api`.

### Frontend
1. Copy `client/.env.example` to `client/.env` if you need a non-default API URL.
2. Run `cd client && npm install && npm run dev`. Vite default: `http://localhost:5173`.

## API overview
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET|POST /api/budgets`, `PUT|DELETE /api/budgets/:id`
- `GET|POST /api/expenses`, `PUT|DELETE /api/expenses/:id`
- `GET /api/dashboard/summary`
- `GET /api/health`

Authenticated endpoints require `Authorization: Bearer <token>`.

## Security and data rules
- Never commit `.env` files or expose backend secrets through `VITE_*` variables.
- All budgets and expenses are scoped to the authenticated user.
- An expense can only reference a budget owned by that user.
- Deleting a budget deletes its linked expenses; the UI confirms this destructive action.
- Allocation and expense amounts must be greater than zero.

## Deployment
The Vercel project serves the frontend only. Deploy the Express API to a Node-compatible host and connect MongoDB Atlas. See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).
