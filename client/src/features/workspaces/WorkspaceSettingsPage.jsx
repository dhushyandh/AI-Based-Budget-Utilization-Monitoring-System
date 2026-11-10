import { useEffect, useState } from 'react';
import { Copy, RefreshCw, Trash2, UserPlus, Users } from 'lucide-react';
import api from '../../lib/api.js';

const roles = ['admin', 'budget_manager', 'approver', 'member', 'viewer'];
export default function WorkspaceSettingsPage() {
  const id = localStorage.getItem('budget_workspace_id');
  const [workspace,setWorkspace]=useState(null), [members,setMembers]=useState([]), [invites,setInvites]=useState([]);
  const [email,setEmail]=useState(''), [role,setRole]=useState('member'), [link,setLink]=useState('');
  const [error,setError]=useState(''), [notice,setNotice]=useState('');
  async function load() {
    try {
      const [w,m,i]=await Promise.all([api.get('/workspaces'),api.get('/workspaces/'+id+'/members'),api.get('/workspaces/'+id+'/invitations').catch(()=>({data:{invitations:[]}}))]);
      setWorkspace((w.data.workspaces||[]).find(x=>x.id===id)); setMembers(m.data.members||[]); setInvites(i.data.invitations||[]);
    } catch(e) { setError(e.response?.data?.message||'Unable to load workspace access.'); }
  }
  useEffect(()=>{load();},[id]);
  async function invite(e) {
    e.preventDefault();setError('');setNotice('');setLink('');
    try { const {data}=await api.post('/workspaces/'+id+'/invitations',{email,role});setLink(location.origin+'/invite/'+id+'?token='+data.inviteToken);setNotice('Invitation created. Share this link with the invited person.');setEmail('');await load(); }
    catch(e){setError(e.response?.data?.message||'Could not create invitation.');}
  }
  async function changeRole(uid,nextRole){try{await api.patch('/workspaces/'+id+'/members/'+uid,{role:nextRole});await load();}catch(e){setError(e.response?.data?.message||'Could not update role.');}}
  async function remove(uid){if(!confirm('Remove this member? Their existing financial records will remain.'))return;try{await api.delete('/workspaces/'+id+'/members/'+uid);await load();}catch(e){setError(e.response?.data?.message||'Could not remove member.');}}
  async function revoke(inviteId){try{await api.delete('/workspaces/'+id+'/invitations/'+inviteId);await load();}catch(e){setError(e.response?.data?.message||'Could not revoke invitation.');}}
  const manager=['owner','admin'].includes(workspace?.role);
  return <div className="page-container-inner">
    <div className="page-header"><div><span className="eyebrow">WORKSPACE SETTINGS</span><h1>People & access</h1><p>Manage members, invitations and permissions.</p></div><button className="btn-secondary" onClick={load}><RefreshCw size={15}/> Refresh</button></div>
    {error&&<div className="notice notice-danger">{error}</div>}{notice&&<div className="notice notice-success">{notice}</div>}
    {workspace&&<><div className="metric-grid">
      <div className="metric-card"><span className="metric-label">WORKSPACE</span><strong className="metric-value">{workspace.name}</strong><small>{workspace.type} · {workspace.role}</small></div>
      <div className="metric-card"><span className="metric-label">MEMBERS</span><strong className="metric-value">{members.length}</strong><small>Active members</small></div>
      <div className="metric-card"><span className="metric-label">PENDING INVITES</span><strong className="metric-value">{invites.length}</strong><small>Awaiting acceptance</small></div>
    </div>
    {manager&&workspace.type==='organization'&&<section className="surface workspace-panel">
      <div className="surface-heading"><div><span className="surface-kicker">COLLABORATION</span><h2>Invite a teammate</h2><p>Invitation links expire after seven days and are restricted to the invited email.</p></div><span className="surface-icon"><UserPlus size={19}/></span></div>
      <form className="invite-form" onSubmit={invite}><label>Email address<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="teammate@company.com"/></label><label>Role<select value={role} onChange={e=>setRole(e.target.value)}>{(workspace.role==='owner'?roles:roles.filter(x=>x!=='admin')).map(x=><option key={x} value={x}>{x.replace('_',' ')}</option>)}</select></label><button className="btn-primary"><UserPlus size={15}/> Create invitation</button></form>
      {link&&<div className="invite-result"><b>Invitation link ready</b><div className="invite-copy"><input readOnly value={link}/><button className="btn-secondary" onClick={()=>navigator.clipboard.writeText(link)}><Copy size={14}/> Copy link</button></div></div>}
    </section>}
    <section className="surface workspace-panel"><div className="surface-heading"><div><span className="surface-kicker">ACCESS CONTROL</span><h2>Workspace members</h2><p>Current people with access to this workspace.</p></div><span className="surface-icon"><Users size={19}/></span></div>
      <div className="member-list">{members.map(m=><div className="member-row" key={m.userId}><div className="member-avatar">{(m.name||m.email||'?').slice(0,1).toUpperCase()}</div><div className="member-details"><b>{m.name}</b><small>{m.email}</small></div><span className="role-pill">{m.role.replace('_',' ')}</span>{manager&&m.role!=='owner'&&<div className="member-actions"><select aria-label={'Role for '+m.email} value={m.role} onChange={e=>changeRole(m.userId,e.target.value)}>{(workspace.role==='owner'?roles:roles.filter(x=>x!=='admin')).map(x=><option key={x} value={x}>{x.replace('_',' ')}</option>)}</select><button className="icon-danger" onClick={()=>remove(m.userId)} title="Remove member"><Trash2 size={15}/></button></div>}</div>)}</div>
    </section>
    {manager&&<section className="surface workspace-panel"><div className="surface-heading"><div><span className="surface-kicker">INVITATIONS</span><h2>Pending invitations</h2><p>Revoke links that should no longer work.</p></div></div>{invites.length?invites.map((v,n)=><div className="member-row" key={v._id||v.email+n}><div className="member-details"><b>{v.email}</b><small>{v.role} · Expires {new Date(v.expiresAt).toLocaleDateString()}</small></div><button className="btn-secondary" onClick={()=>revoke(v._id)}>Revoke</button></div>):<p className="muted">No pending invitations.</p>}</section>}
    </>}
  </div>;
}
