"use client";
import { createContext,useContext,useEffect,useRef,useState,useCallback,type ReactNode } from "react";
import { initialState,type PlatformState } from "@/lib/platform-model";
import { changesBetween } from "@/lib/platform-records";
import { browserSupabase } from "@/lib/supabase/client";
type ContextValue={state:PlatformState;ready:boolean;saving:boolean;error:string;refresh:()=>Promise<PlatformState|null>;update:(change:(draft:PlatformState)=>void)=>Promise<boolean>;action:(body:Record<string,unknown>)=>Promise<Record<string,unknown>|null>};
const Context=createContext<ContextValue|null>(null);
export function PlatformProvider({children}:{children:ReactNode}){
 const [state,setState]=useState<PlatformState>(initialState),[ready,setReady]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState("");
 const current=useRef(state),revisions=useRef<Record<string,number>>({}),busy=useRef(false);
 const accept=useCallback((data:{state:PlatformState;revisions:Record<string,number>})=>{current.current=data.state;revisions.current=data.revisions;setState(data.state);return data.state},[]);
 const refresh=useCallback(async()=>{try{const r=await fetch("/api/platform",{cache:"no-store"});const data=await r.json();if(!r.ok)throw new Error(data.error?.message||"Data gagal dimuat.");setError("");return accept(data)}catch(e){setError((e as Error).message);return null}finally{setReady(true)}},[accept]);
 useEffect(()=>{void refresh();let cleanup=()=>{};try{const {data}=browserSupabase().auth.onAuthStateChange(()=>{setTimeout(()=>void refresh(),0)});cleanup=()=>data.subscription.unsubscribe()}catch{}
 return cleanup;},[refresh]);
 async function action(body:Record<string,unknown>){
  if(busy.current)return null;busy.current=true;setSaving(true);setError("");
  try{const r=await fetch("/api/platform/actions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw new Error(data.error?.message||"Perubahan belum tersimpan.");accept(data);return data.result||{};}catch(e){setError((e as Error).message);return null}finally{busy.current=false;setSaving(false)}
 }
 async function update(change:(draft:PlatformState)=>void){
  if(busy.current)return false;const next=structuredClone(current.current);change(next);
  if(current.current.session.loggedIn&&!next.session.loggedIn){try{await browserSupabase().auth.signOut();await refresh();return true}catch(e){setError((e as Error).message);return false}}
  const changes=changesBetween(current.current,next,revisions.current);if(!changes.length)return true;
  busy.current=true;setSaving(true);setError("");
  try{const r=await fetch("/api/platform",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({changes})});const data=await r.json();if(!r.ok)throw new Error(data.error?.details?.[0]?.message||data.error?.message||"Perubahan belum tersimpan.");accept(data);return true;}catch(e){setError((e as Error).message);return false}finally{busy.current=false;setSaving(false)}
 }
 return <Context.Provider value={{state,ready,saving,error,refresh,update,action}}>{children}{saving?<div role="status" className="save-status">Menyimpan…</div>:error?<div role="alert" className="save-status"><p>{error}</p><button type="button" className="mt-2 min-h-11 text-primary-700 underline" onClick={()=>void refresh()}>Coba lagi</button></div>:null}</Context.Provider>;
}

export function usePlatform(){const value=useContext(Context);if(!value)throw new Error("PlatformProvider diperlukan.");return value;}
