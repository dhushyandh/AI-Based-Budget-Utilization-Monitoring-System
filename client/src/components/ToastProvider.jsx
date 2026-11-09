import {createContext,useCallback,useContext,useRef,useState} from 'react';
import {CheckCircle2,Info,AlertTriangle,X} from 'lucide-react';
const ToastContext=createContext(null);
export function ToastProvider({children}){
 const [items,setItems]=useState([]),[dialog,setDialog]=useState(null),resolver=useRef(null);
 const dismiss=useCallback(id=>setItems(v=>v.filter(x=>x.id!==id)),[]);
 const toast=useCallback((message,type='success')=>{const id=Date.now()+Math.random();setItems(v=>[...v,{id,message,type}]);setTimeout(()=>dismiss(id),4200);},[dismiss]);
 const confirm=useCallback(options=>new Promise(resolve=>{resolver.current=resolve;setDialog({title:options.title||'Are you sure?',message:options.message||'Please confirm this action.',confirmLabel:options.confirmLabel||'Continue',danger:!!options.danger});}),[]);
 const finish=value=>{setDialog(null);resolver.current?.(value);resolver.current=null;};
 return <ToastContext.Provider value={{toast,confirm}}>{children}<div className="toast-stack" aria-live="polite">{items.map(item=><div className={'toast toast-'+item.type} key={item.id}><span className="toast-icon">{item.type==='error'?<AlertTriangle size={18}/>:item.type==='info'?<Info size={18}/>:<CheckCircle2 size={18}/>}</span><span>{item.message}</span><button aria-label="Dismiss notification" onClick={()=>dismiss(item.id)}><X size={16}/></button></div>)}</div>{dialog&&<div className="modal-backdrop dialog-backdrop" onMouseDown={e=>e.target===e.currentTarget&&finish(false)}><section className="modal-card confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><div className="confirm-mark">{dialog.danger?<AlertTriangle/>:<Info/>}</div><h2 id="confirm-title">{dialog.title}</h2><p>{dialog.message}</p><div className="modal-actions"><button className="btn-secondary" onClick={()=>finish(false)}>Cancel</button><button className={dialog.danger?'btn-danger':'btn-primary'} onClick={()=>finish(true)}>{dialog.confirmLabel}</button></div></section></div>}</ToastContext.Provider>;
}
export function useToast(){const value=useContext(ToastContext);if(!value)throw new Error('useToast must be used inside ToastProvider');return value;}
