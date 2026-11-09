import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../lib/api.js';
export default function AcceptInvitationPage(){
 const {workspaceId}=useParams();const [params]=useSearchParams();const navigate=useNavigate();const [message,setMessage]=useState('Checking your invitation…');const [failed,setFailed]=useState(false);
 useEffect(()=>{const token=params.get('token');if(!token){setFailed(true);setMessage('Invitation token is missing.');return;}
 api.post('/workspaces/'+workspaceId+'/accept-invitation',{token}).then(({data})=>{localStorage.setItem('budget_workspace_id',data.workspace.id);setMessage('Invitation accepted. Opening '+data.workspace.name+'…');setTimeout(()=>navigate('/',{replace:true}),800);}).catch(e=>{setFailed(true);setMessage(e.response?.data?.message||'Could not accept invitation. Sign in with the invited email.');});},[workspaceId]);
 return <div className="invite-accept-screen"><div className="surface invite-accept-card"><h1>{failed?'Invitation unavailable':'Joining workspace'}</h1><p>{message}</p>{failed&&<button className="btn-primary" onClick={()=>navigate('/')}>Back to workspace</button>}</div></div>;
}
