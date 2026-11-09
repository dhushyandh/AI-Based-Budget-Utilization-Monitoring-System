# Deployment Guide

## Frontend on Vercel
<<<<<<< HEAD
This repository is configured with `vercel.json` to build the Vite app from `client/` and publish `client/dist`. Set `VITE_API_URL` in the Vercel project to the public API base URL ending in `/api`, then redeploy.

## Backend
The Express + MongoDB API is a long-running Node service. Deploy `server/` to a Node-compatible host (for example Render or Railway) with:
- `MONGO_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: random secret with at least 32 characters
- `CLIENT_ORIGIN`: deployed frontend origin, such as `https://budget-utilization-monitor.vercel.app`
- `PORT`: supplied by the host

The API health endpoint is `/api/health`. Configure Atlas network access to permit the chosen host, and create a database user with least privilege. Never commit `.env` files or expose secrets in Vite variables.

## Important
Vercel deploys the frontend only in this configuration. The API will not function until the backend and MongoDB are configured and deployed, and the frontend's `VITE_API_URL` points to that API.
=======
The project is configured with `vercel.json` to build the Vite app from `client/` and publish `client/dist`. Set `VITE_API_URL` in the Vercel project to the public API base URL ending in `/api`, then redeploy.

## Backend
The Express + MongoDB API is a long-running Node service. Deploy `server/` to a Node-compatible host with:
- `MONGO_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: random secret with at least 32 characters
- `CLIENT_ORIGIN`: deployed frontend origin
- `PORT`: supplied by the host

The API health endpoint is `/api/health`. Configure MongoDB Atlas network access for the chosen host and create a least-privilege database user.

## Important
Vercel deploys the frontend only in this configuration. The API will not function until the backend and MongoDB are configured and deployed, and the frontend's `VITE_API_URL` points to that API. Never commit `.env` files or expose secrets in Vite variables.
>>>>>>> 62212d2b24da30063f89cc48fa2746ba4beb69f8
