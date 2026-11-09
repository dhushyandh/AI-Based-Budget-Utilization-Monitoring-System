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


## Workspaces (feature branch)
The multi-workspace foundation supports personal workspaces and organization workspaces. Workspace membership is stored with explicit roles (`owner`, `admin`, `budget_manager`, `approver`, `member`, `viewer`). The first authenticated workspace-list request provisions a personal workspace and attaches legacy budgets and expenses to it in place, preserving existing document IDs and financial data.

The client sends the active workspace in the `X-Workspace-Id` header. The API verifies membership before workspace-scoped financial reads and writes. Existing clients that omit the header retain legacy user-scoped behavior during rollout.

### Workspace API
- `GET /api/workspaces` — list memberships and ensure a personal workspace exists.
- `POST /api/workspaces` — create an organization workspace (creator becomes owner).
- `PATCH /api/workspaces/:id` — owner can rename a workspace or change its ISO currency code.

This phase establishes workspace boundaries. Invitations, membership administration, approval workflows, commitments, and audit events are subsequent phases and are not represented as implemented yet.

### Collaboration and access control (Phase 2)
- Workspace owners and admins can create, list, and revoke invitations. Invite tokens are generated using cryptographic randomness; only a SHA-256 hash is stored.
- Invitations are bound to the invited email, expire after seven days, and can only be accepted by an authenticated account with that same email.
- Invitation delivery is currently manual: the create-invitation response returns a one-time token. No email provider is configured, so the API does not claim to send email.
- Owners/admins can list members; role changes and removal are restricted so admins cannot modify owners or other admins. Ownership cannot be transferred or removed through these endpoints.
- Workspace roles now gate writes: viewers are read-only; members and approvers can write expenses; budget managers, admins, and owners can write budgets and expenses.
- New endpoints: GET /api/workspaces/:id/members, POST|GET /api/workspaces/:id/invitations, DELETE /api/workspaces/:id/invitations/:invitationId, PATCH|DELETE /api/workspaces/:id/members/:userId, and authenticated POST /api/workspaces/:id/accept-invitation with { token }.

### Workspace collaboration UI
The authenticated workspace sidebar includes a People & access screen for owners and admins. It lists workspace members, supports permitted role changes and removals, creates invitation links, and lists/revokes pending invitations. Invitees sign in with the invited email and open the invitation URL to accept. No email delivery provider is configured; invitation links must be shared securely by the workspace administrator.
