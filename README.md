# AI-Based Budget Utilization Monitoring System

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
