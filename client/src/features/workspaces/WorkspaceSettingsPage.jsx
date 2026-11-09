import { useEffect, useState } from 'react';
import { Copy, RefreshCw, Trash2, UserPlus, Users, Mail, ShieldCheck, Clock3, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../components/ToastProvider.jsx';
import api from '../../lib/api.js';

const roles = ['admin', 'budget_manager', 'approver', 'member', 'viewer'];
export default function WorkspaceSettingsPage() {
  const {toast,confirm}=useToast();
  const id = localStorage.getItem('budget_workspace_id');
  const [workspace,setWorkspace]=useState(null), [members,setMembers]=useState([]), [invites,setInvites]=useState([]);
  const [email,setEmail]=useState(''), [role,setRole]=useState('member'), [link,setLink]=useState('');
  const [error,setError]=useState(''), [notice,setNotice]=useState(''), [busy,setBusy]=useState(false);
  async function load() {
    try {
      const [w,m,i]=await Promise.all([api.get('/workspaces'),api.get('/workspaces/'+id+'/members'),api.get('/workspaces/'+id+'/invitations').catch(()=>({data:{invitations:[]}}))]);
      setWorkspace((w.data.workspaces||[]).find(x=>x.id===id)); setMembers(m.data.members||[]); setInvites(i.data.invitations||[]);
    } catch(e) { setError(e.response?.data?.message||'Unable to load workspace access.'); }
  }
  useEffect(()=>{load();},[id]);
  async function invite(e) {
    e.preventDefault();setError('');setNotice('');setLink('');
    try { const {data}=await api.post('/workspaces/'+id+'/invitations',{email,role});setLink(location.origin+'/invite/'+id+'?token='+data.inviteToken);setNotice('Invitation created. Email delivery is not configured, so copy and send this secure link to the invited person.');setEmail('');toast('Invitation link created. Copy it to share with your teammate.','success');await load(); }
    catch(e){setError(e.response?.data?.message||'Could not create invitation.');}
  }
  async function changeRole(uid,nextRole){try{await api.patch('/workspaces/'+id+'/members/'+uid,{role:nextRole});await load();}catch(e){setError(e.respon...[truncated]