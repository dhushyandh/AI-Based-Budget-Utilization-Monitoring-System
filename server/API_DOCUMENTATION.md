# API Documentation

Base URL: `http://localhost:5000/api`

All routes except `/auth/register`, `/auth/login`, and `/health` require:
`Authorization: Bearer <JWT>`

## Health
- `GET /health` — returns service status.

## Authentication
- `POST /auth/register` — JSON `{ "name": "Demo User", "email": "demo@example.com", "password": "password123" }`
- `POST /auth/login` — JSON `{ "email": "demo@example.com", "password": "password123" }`
- `GET /auth/me` — current account details.

Successful registration/login returns `{ token, user }`.

## Budgets
- `GET /budgets` — list current user's budgets with spent and remaining values.
- `POST /budgets` — JSON `{ "title": "IT Equipment", "department": "IT", "allocatedAmount": 100000, "period": "Quarterly" }`
- `PUT /budgets/:id` — update budget fields.
- `DELETE /budgets/:id` — delete a budget and its linked expenses.

## Expenditures
- `GET /expenses` — list current user's expenses. Optional query parameters: `budget`, `category`, `search`.
- `POST /expenses` — JSON `{ "budget": "<budgetId>", "title": "Laptop", "category": "Equipment", "amount": 45000, "date": "2026-10-01", "description": "Development laptop" }`
- `PUT /expenses/:id` — update expense fields.
- `DELETE /expenses/:id` — delete an expense.

## Dashboard
- `GET /dashboard/summary` — totals, per-budget utilization, category totals, recent expenses and rule-based insights.

## Validation and security notes
- Passwords are hashed with bcrypt before storage.
- JWTs expire after seven days.
- API routes are scoped to the authenticated user's records.
- Budget allocations and expense amounts must be greater than zero.
- Expense creation verifies that the selected budget belongs to the signed-in user.
- Helmet, CORS and rate limiting are enabled. Configure `CLIENT_ORIGIN` for the deployed frontend.
