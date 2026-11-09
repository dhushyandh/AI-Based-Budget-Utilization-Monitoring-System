import { useEffect,useState } from 'react';
import { ArrowDownRight,ArrowUpRight,CalendarDays,Plus,Wallet,ReceiptText,Landmark,ChartNoAxesCombined,Lightbulb,AlertTriangle,CheckCircle2,TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Area,AreaChart,CartesianGrid,ResponsiveContainer,Tooltip,XAxis,YAxis,PieChart,Pie,Cell } from 'recharts';
import api from '../../lib/api.js'; import {currency} from '../../lib/format.js'; import {PageHeader,Loading,ErrorState,EmptyState} from '../../components/UI.jsx';
const colors=['#526fe0','#20a27c','#d99a35','#d46675','#8a70c7','#4197a8'];
function FinanceTooltip({active,payload,label}){if(!active||!payload?.length)return null;return <div className="finance-chart-tooltip"><b>{label}</b>{payload.map(item=><div key={item.dataKey}><i style={{background:item.color}}/>{item.name||item.dataKey}<strong>{currency(item.value)}</strong></div>)}</div>}
function Metric({label,value,sub,Icon,tone}) { return <article className="metric-card"><div className={'metric-icon '+tone}><Icon size={18}/></div><span className="metric-label">{label}</span><strong>{value}</strong><small>{sub}</small></article>; }
export default function DashboardPage() {
 const [data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const load=()=>{setLoading(true);api.get('/dashboard/summary').then(r=>setData(r.data)).catch(e=>setError(e.response?.data?.message||'Could not load dashboard data')).finally(()=>setLoading(false));};
 useEffect(()=>{load();},[]);
 if(loading)return <Loading/>; if(error)return <ErrorState message={error} onRetry={load}/>;
 const t=data.totals||{}, budgets=data.budgets||[], categories=(data.category||[]).map(x=>({name:x._id,value:x.total}));
 const chart=budgets.map(b=>({name:b.title,allocated:b.allocatedAmount,spent:b.spent}));
 return <><PageHeader eyebrow="YOUR FINANCIAL OVERVIEW" title="Good morning" description="A clear view of your allocations, spending, and what rema...[truncated]