# Viva Preparation Notes

## Project in one minute
The AI-Based Budget Utilization Monitoring System is a full-stack web application concept for recording budget allocations and expenditures. It calculates total spending, utilization percentage and remaining balance, then presents summaries and rule-based alerts through a dashboard. The frontend uses React, the API uses Node.js and Express, and MongoDB stores user, budget and expense records.

## Core formulae
- Utilization (%) = (Total expenditure / Allocated budget) × 100
- Remaining budget = Allocated budget − Total expenditure

Example: allocation ₹100,000; expenditure ₹60,000; utilization 60%; remaining ₹40,000.

## Common questions
**Why MongoDB?** It stores flexible document records and integrates naturally with JavaScript applications.

**What is CRUD?** Create, Read, Update and Delete — the basic operations for maintaining records.

**What does Express do?** It provides routing and middleware for the backend API.

**How does React communicate with the backend?** The client sends HTTP requests to Express API endpoints; the server validates and processes them, accesses MongoDB and returns JSON responses.

**How is utilization calculated?** Total expenditure is divided by allocated budget and multiplied by 100. The application rejects zero or negative allocations to avoid invalid division.

**Is the current insight engine a trained AI model?** No. The current implementation uses transparent rules and thresholds to identify high utilization and overspending. A trained predictive model or external LLM integration is future work and must not be claimed as implemented.

**What security measures are included?** Password hashing, expiring JWTs, authenticated routes, user-scoped database queries, input validation, Helmet, CORS configuration and rate limiting.

## Be ready to demonstrate
Register/login → create a budget → add expenses → show dashboard totals → trigger a high-utilization alert → edit/delete a record → export CSV.
