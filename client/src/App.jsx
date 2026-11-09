import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
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
import OnboardingPage from './features/onboarding/OnboardingPage.jsx';
function AppRoutes(){const{token,user,loading}=useAuth();const location=useLocation();if(loading)return <div className="app-loading"><span className="spinner"/> Preparing your workspace…</div>;if(token&&user&&!user.onboardingCompleted&&location.pathname!=='/onboarding'&&!location.pathname.startsWith('/invite/'))return <Navigate to="/onboarding" replace/>;return <Routes><Route path="/auth" element={token?<Navigate to={location.state?.from?.pathname||'/'} replace/>:<AuthPage/>}/><Route path="/onboarding" element={token?<OnboardingPage/>:<Navigate to="/auth" replace/>}/><Route path="/invite/:workspaceId" element={token?<AcceptInvitationPage/>:<Navigate to="/auth" state={{from:location}} replace/>}/><Route element={token?<WorkspaceLayout/>:<Navigate to="/auth" replace/>}><Route path="/" element={<DashboardPage/>}/><Route path="/budgets" element={<BudgetsPage/>}/><Route path="/expenses" element={<ExpensesPage/>}/><Route path="/reports" element={<ReportsPage/>}/><Route path="/approvals" element={<ApprovalsPage/>}/><Route path="/profile" element={<ProfilePage/>}/><Route path="/settings" element={<Workspa...[truncated]