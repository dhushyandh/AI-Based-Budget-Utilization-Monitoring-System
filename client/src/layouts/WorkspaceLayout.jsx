import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { Bell, UserCircle, ChevronDown, LayoutDashboard, LogOut, Menu, ReceiptText, Settings2, Wallet, WalletCards, X, ChartNoAxesCombined, CircleHelp, Settings, CheckCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { initials } from '../lib/format.js';
import {useToast} from '../components/ToastProvider.jsx';
import {Plus} from 'lucide-react';
const links=[['Overview','/',LayoutDashboard],['Budgets','/budgets',Wallet],['Transactions','/expenses',ReceiptText],['Reports','/reports',ChartNoAxesCombined],['Approvals','/approvals',Bell],['Profile','/profile',UserCircle],['People & access','/settings',Settings2]];
export default function WorkspaceLayout() {
 const {toast}=useToast();const {user,signOut}=useAuth(); const [mobile,setMobile]=useState(false); const [profileOpen,setProfileOpen]=useState(false); const location=useLocation();
 const [orgModal,setOrgModal]=useState(false),[orgName,setOrgName]=useState(''),[orgBusy,setOrgBusy]=useState(false);const [workspaces,setWorkspaces]=useState([]); const [workspaceReady,setWorkspaceReady]=useState(false); const [workspaceId,setWorkspaceId]=useState(localStorage.getItem('budget_workspace_id')||'');
 useEffect(()=>{let active=true;api.get('/workspaces').then(({data})=>{if(!active)return;const list=data.workspaces||[];setWorkspaces(list);const selected=list.find(w=>w.id===localStorage.getItem('budget_workspace_id'))||list.find(w=>w.type==='personal')||list[0];if(selected){localStorage.setItem('budget_workspace_id',selected.id);setWorkspaceId(selected.id);}setWorkspaceReady(true);}).catch(()=>setWorkspaceReady(true));return()=>{active=false};},[]);
 async function createOrganization(e){e?.preventDefault();if(orgName.trim().length<2){toast('Enter an organization name with at least 2 characters.','error');return;}setOrgBusy(true);try{co...[truncated]