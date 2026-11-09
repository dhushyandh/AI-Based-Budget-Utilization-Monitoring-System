# AI-Based Budget Utilization Monitoring System

<<<<<<< HEAD
A runnable MERN-stack project for managing budgets, recording expenditures, monitoring utilization, and viewing rule-based financial insights.

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas connection string

## Setup

### 1. Backend
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
Update `MONGO_URI` in `server/.env`. The API runs at `http://localhost:5000`.

### 2. Frontend
Open another terminal:
```bash
cd client
npm install
npm run dev
```
Open the Vite URL (normally `http://localhost:5173`).

## Demo workflow
1. Register an account.
2. Create one or more budgets.
3. Add expenditure records and link each to a budget.
4. Review dashboard totals, charts and smart insights.
5. Export expenditure records as CSV.

## Features
- JWT registration/login
- User-scoped budget and expenditure CRUD
- Dashboard summary and charts
- Budget utilization and remaining-balance calculations
- Rule-based alerts for high utilization and overspending
- Search/filter and CSV export

## Important calculation rules
- Utilization (%) = (Total expenditure / Allocated budget) × 100
- Remaining budget = Allocated budget − Total expenditure
- Zero or negative allocated budgets are rejected.
- An expense is included in totals only when it belongs to the signed-in user and selected budget.

## About the “AI-based” title
The current insights module uses explainable rule-based analysis (thresholds and category totals). It is not a trained machine-learning model or an LLM. The UI labels it “Smart Insights” to avoid claiming AI capabilities that are not implemented. An actual AI provider integration can be added separately with an API key.

## Project structure
```
client/  React + Vite frontend
server/  Express + MongoDB API
```
=======
A MERN-based budget and expense monitoring application with dashboard analytics and transparent rule-based spending insights.

> Note: the current insights engine is rule-based. It is not a trained machine-learning model or LLM integration.

## Project structure
- `client/` — React + Vite frontend
- `server/` — Express + MongoDB API
- Project documentation includes API, testing, deployment and viva preparation.

## Requirements
- Node.js 20+
- MongoDB connection string

## Setup
1. Configure `server/.env` using `server/.env.example`.
2. Install server dependencies: `cd server && npm install`.
3. Start API: `npm run dev`.
4. Configure `client/.env` using `client/.env.example`.
5. Install frontend dependencies: `cd client && npm install`.
6. Start frontend: `npm run dev`.

See `DEPLOYMENT_GUIDE.md` before deployment. The Express API needs a Node-capable host and MongoDB; Vercel is intended for the Vite frontend.
>>>>>>> 62212d2b24da30063f89cc48fa2746ba4beb69f8
