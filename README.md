# AI-Based Budget Utilization Monitoring System

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
