import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, WalletCards } from 'lucide-react';
import api from '../../lib/api.js';
import { useAuth } from './AuthContext.jsx';
import {useToast} from '../../components/ToastProvider.jsx';
export default function AuthPage() {
  const { signIn } = useAuth(); const {toast}=useToast(); const location=useLocation(); const navigate=useNavigate(); const [mode,setMode] = useState('login'); const [show,setShow] = useState(false);
  const [form,setForm] = useState({ name:'', email:'', password:'' }); const [error,setError] = useState(''); const [busy,setBusy] = useState(false);
  const update = e => setForm(p => ({...p,[e.target.name]:e.target.value}));
  async function submit(e) { e.preventDefault(); setBusy(true); setError(''); try { const {data}=await api.post('/auth/'+mode,form); signIn(data); navigate(location.state?.from?.pathname ? location.state.from.pathname+location.state.from.search : '/', {replace:true}); } catch(err) { const message=err.response?.data?.message || 'Unable to connect. Please try again.';setError(message);toast(message,'error'); } finally { setBusy(false); } }
  return <main className="auth-screen"><section className="auth-story"><div className="brand brand-light"><span className="brand-icon"><WalletCards size={21}/></span> ledgerly</div><div className="story-copy"><span className="overline">PERSONAL FINANCE, WITH CLARITY</span><h1>Give every rupee<br/>a <em>clear purpose.</em></h1><p>Plan with confidence, understand your spending, and stay ahead of your budget.</p><img className="auth-illustration" src="/images/ledgerly-workspace-illustration.svg" alt="Ledgerly budget overview illustration"/><div className="story-metrics"><div><b>01</b><span>Plan allocations</span></div><div><b>02</b><span>Track expenses</span></div><div><b>03</b><span>Make better decisions</span></div></div></div><span className="story-foot">BUDGET UTILIZATION MONI...[truncated]