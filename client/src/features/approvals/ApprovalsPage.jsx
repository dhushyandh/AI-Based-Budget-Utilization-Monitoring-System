import { useEffect, useState } from 'react';
import { Check, X, RefreshCw, ClipboardCheck } from 'lucide-react';
import api from '../../lib/api.js';

export default function ApprovalsPage() {
  const [items,setItems]=useState([]), [loading,setLoading]=useState(true), [error,setError]=useState(''), [comments,setComments]=useState({});
  async function load(){setLoading(true);setError('');try{const {data}=await api.get('/approvals');setItems(data.approvals||[]);}catch(e){setError(e.response?.data?.message||'Unable to load approval requests.');}finally{setLoading(false);}}
  useEffect(()=>{load();},[]);
  async function decide(id,decision){const comment=(comments[id]||'').trim();if(!comment){setError('Add a review comment before making a decision.');return;}try{await api.post('/approvals/'+id+'/decision',{decision,comment});await load();}catch(e){setError(e.response?.data?.message||'Unable to record decision.');}}
  const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n||0);
  if(loading)return <div className="app-loading"><span className="spinner"/> Loading approval queue…</div>;
  return <div className="page-container-inner">
    <div className="page-header"><div><span className="eyebrow">FINANCIAL CONTROLS</span><h1>Budget approvals</h1><p>Review submitted budget requests and keep decisions traceable.</p></div><button className="btn-secondary" onClick={load}><RefreshCw size={15}/> Refresh</button></div>
    {error&&<div className="notice notice-danger">{error}</div>}
    <div className="metric-grid"><div className="metric-card"><span className="metric-label">TOTAL REQUESTS</span><strong className="metric-value">{items.length}</strong></div><div className="metric-card"><span className="metric-label">PENDING</span><strong className="metric-value">{items.filter(x=>x.status==='pending').length}</strong></div><div className="metric-card"><span className="metric-label">DECIDED</span><strong className="metric-value">{items.filter(x=>x.status!=='pending').length}</strong></div></div>
    {items.length?items.map(item=><article className="surface workspace-panel" key={item._id}>
      <div className="surface-heading"><div><span className="surface-kicker">{item.status.toUpperCase()} · {item.department||'General'}</span><h2>{item.title}</h2><p>{item.requestedBy?.name||'Workspace member'} · {new Date(item.createdAt).toLocaleString()}</p></div><span className="role-pill">{item.status}</span></div>
      <div className="metric-grid"><div className="metric-card"><span className="metric-label">REQUESTED ALLOCATION</span><strong className="metric-value">{money(item.allocatedAmount)}</strong></div><div className="metric-card"><span className="metric-label">PERIOD</span><strong className="metric-value">{item.period}</strong></div></div>
      {item.status==='pending'&&<><label className="form-stack">Review comment<textarea rows="2" value={comments[item._id]||''} onChange={e=>setComments({...comments,[item._id]:e.target.value})} placeholder="Explain the approval or rejection decision…"/></label><div className="modal-actions"><button className="btn-secondary" onClick={()=>decide(item._id,'rejected')}><X size={15}/> Reject</button><button className="btn-primary" onClick={()=>decide(item._id,'approved')}><Check size={15}/> Approve</button></div></>}
      {item.status!=='pending'&&<p className="muted">Reviewed by {item.reviewedBy?.name||'Workspace reviewer'} · {item.reviewComment}</p>}
      {item.history?.length>0&&<details><summary>Decision history ({item.history.length})</summary>{item.history.map((h,i)=><p key={i}>{h.action} · {new Date(h.at).toLocaleString()} {h.comment&&' — '+h.comment}</p>)}</details>}
    </article>):<div className="surface workspace-panel"><ClipboardCheck size={26}/><h2>No approval requests yet</h2><p>Submit a budget from the budget workflow to start a review.</p></div>}
  </div>;
}