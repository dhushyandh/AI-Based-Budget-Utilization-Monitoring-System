import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext.jsx';
import AuthPage from './features/auth/AuthPage.jsx';
import WorkspaceLayout from './layouts/WorkspaceLayout.jsx';
import DashboardPage from './features/dashboard/DashboardPage.jsx';
import BudgetsPage from './features/budgets/BudgetsPage.jsx';
import ExpensesPage from './features/expenses/ExpensesPage.jsx';
import ReportsPage from './features/reports/ReportsPage.jsx';
import WorkspaceSettingsPage from './features/workspaces/WorkspaceSettingsPage.jsx';
import AcceptInvitationPage from './features/workspaces/AcceptInvitationPage.jsx';
import ApprovalsPage from './features/approvals/ApprovalsPage.jsx';
import ProfilePage from './features/profile/ProfilePage.jsx';
function AppRoutes(){const{token,loading}=useAuth();if(loading)return <div className="app-loading"><span className="spinner"/> Preparing your workspace…</div>;return <Routes><Route path="/auth" element={token?<Navigate to="/" replace/>:<AuthPage/>}/><Route path="/invite/:workspaceId" element={token?<AcceptInvitationPage/>:<Navigate to="/auth" replace/>}/><Route element={token?<WorkspaceLayout/>:<Navigate to="/auth" replace/>}><Route path="/" element={<DashboardPage/>}/><Route path="/budgets" element={<BudgetsPage/>}/><Route path="/expenses" element={<ExpensesPage/>}/><Route path="/reports" element={<ReportsPage/>}/><Route path="/approvals" element={<ApprovalsPage/>}/><Route path="/profile" element={<ProfilePage/>}/><Route path="/settings" element={<WorkspaceSettingsPage/>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes>}
export default function App(){return <AuthProvider><AppRoutes/></AuthProvider>}
