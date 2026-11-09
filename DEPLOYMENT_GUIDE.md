# Deployment Guide

## Recommended topology
- **Frontend:** Vercel static deployment from `client/dist`.
- **API:** Node-compatible host running `server/src/server.js` (Render, Railway, or equivalent).
- **Database:** MongoDB Atlas.

## Frontend environment
Set `VITE_API_URL` in the Vercel project to the deployed API base URL ending in `/api`, for example `https://your-api.example.com/api`. Redeploy after changing environment variables.

## Backend environment
Configure these server-side variables on the API host:
- `MONGO_URI`: MongoDB Atlas connection string.
- `JWT_SECRET`: random secret of at least 32 characters.
- `CLIENT_ORIGIN`: exact deployed frontend origin.
- `PORT`: supplied by the hosting platform (if required).

## MongoDB Atlas
Create a dedicated database user with least-privilege access. Restrict network access to the API host where supported. Do not expose database credentials in frontend variables.

## Smoke checks
1. Open `/api/health` on the deployed API and expect `{ "status": "ok", "service": "budget-monitor-api" }`.
2. Register a test account.
3. Create a budget and add an expense.
4. Verify the dashboard totals update.
5. Verify a second account cannot access the first account's budgets or expenses.

## Current deployment boundary
The connected Vercel project is configured to build and publish the React frontend. It does not host the Express API in the current topology. The application is not fully production-functional until the API and MongoDB environment are configured and the frontend points to that API.
