# Manual Testing Checklist

Run the backend and frontend locally, then verify each case. Record actual results and screenshots; do not mark a case passed until you perform it.

| ID | Test | Expected result |
|---|---|---|
| AUTH-01 | Register with valid name, email and password (8+ chars) | Account created and dashboard opens |
| AUTH-02 | Register same email again | Duplicate account rejected |
| AUTH-03 | Login with incorrect password | Clear invalid-credentials message |
| AUTH-04 | Open a protected API without token | HTTP 401 |
| BUD-01 | Create budget with positive amount | Budget appears in budget list |
| BUD-02 | Create budget with zero/negative amount | Validation message; no record created |
| BUD-03 | Edit budget allocation | Updated allocation is displayed |
| BUD-04 | Delete budget | Budget and its linked expenses are deleted |
| EXP-01 | Add expense linked to own budget | Expense appears in expenditure list |
| EXP-02 | Add expense with invalid/non-positive amount | Validation message; no record created |
| EXP-03 | Link expense to another user's budget ID | Request rejected |
| EXP-04 | Edit and delete an expense | List and dashboard totals update |
| DASH-01 | Allocate 100000 and record 60000 expense | 60% utilization and 40000 remaining |
| DASH-02 | Spend more than allocation | Utilization exceeds 100%; negative remaining shown |
| DASH-03 | No budgets/expenses | Empty states display without crashing |
| EXP-05 | Search and export CSV | Matching rows filter; CSV downloads |

## Evidence to capture
1. Registration/login screen (use a test account, never show a real password).
2. Dashboard with at least two budgets and multiple expenses.
3. Budget creation/edit screen and budget list.
4. Expense creation and expenditure table.
5. Utilization chart and smart insight alert.
6. CSV file opened in a spreadsheet application.
7. API health endpoint response.
