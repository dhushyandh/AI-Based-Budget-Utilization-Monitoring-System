import { AlertCircle, CheckCircle2, LoaderCircle, Plus } from 'lucide-react';
export function PageHeader({eyebrow,title,description,action}) { return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>; }
export function Button({children,variant='primary',...props}) { return <button className={'button button-'+variant} {...props}>{children}</button>; }
export function Loading({label='Loading your data…'}) { return <div className="state-panel"><LoaderCircle className="spin" size={22}/>{label}</div>; }
export function ErrorState({message,onRetry}) { return <div className="notice notice-danger"><AlertCircle size={18}/><span>{message}</span>{onRetry&&<button onClick={onRetry}>Try again</button>}</div>; }
export function EmptyState({title,description,action}) { return <div className="empty-state"><span className="empty-icon"><Plus size={20}/></span><b>{title}</b><p>{description}</p>{action}</div>; }
export function Success({children}) { return <div className="notice notice-success"><CheckCircle2 size={17}/>{children}</div>; }
