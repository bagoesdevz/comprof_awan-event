"use client";
import { createContext,useContext,useEffect,useRef,useState,useCallback,type ReactNode } from "react";
import { initialState,type PlatformState } from "@/lib/platform-model";
import { changesBetween } from "@/lib/platform-records";
import { browserSupabase } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";
import { listenForContentChanges,hasContentChanges } from "@/lib/platform-sync";
type ContextValue={state:PlatformState;ready:boolean;saving:boolean;error:string;refresh:()=>Promise<PlatformState|null>;update:(change:(draft:PlatformState)=>void)=>Promise<boolean>;action:(body:Record<string,unknown>)=>Promise<Record<string,unknown>|null>};
const Context=createContext<ContextValue|null>(null);
export function PlatformProvider({children}:{children:ReactNode}){
 const pathname=usePathname();
 const [state,setState]=useState<PlatformState>(initialState),[ready,setReady]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState("");
 const current=useRef(state),revisions=useRef<Record<string,number>>({}),busy=useRef(false),authEpoch=useRef(0),readVersion=useRef(0),refreshAgain=useRef(false);
 const contentSync=useRef<ReturnType<typeof listenForContentChanges>>();
 const accept=useCallback((data:{state:PlatformState;revisions:Record<string,number>})=>{const next={...data.state,cms:JSON.stringify(current.current.cms)===JSON.stringify(data.state.cms)?current.current.cms:data.state.cms};current.current=next;revisions.current=data.revisions;setState(next);return next},[]);
 const refresh=useCallback(async(background=false)=>{
  if(busy.current){refreshAgain.current=true;return current.current;}
  const epoch=authEpoch.current,version=++readVersion.current;
  try{const r=await fetch("/api/platform",{cache:"no-store",signal:AbortSignal.timeout(30000)});const data=await r.json();if(epoch!==authEpoch.current)return null;if(version!==readVersion.current)return r.ok?data.state:current.current;if(!r.ok)throw new Error(data.error?.message||"Data gagal dimuat.");if(!background)setError("");setReady(true);return accept(data)}catch(e){if(!background&&epoch===authEpoch.current&&version===readVersion.current)setError((e as Error).name==="TimeoutError"?"Data belum dapat dimuat. Silakan coba lagi.":(e as Error).message==="Failed to fetch"?"Tidak dapat terhubung. Periksa koneksi Anda, lalu coba lagi.":(e as Error).message);return null}
 },[accept]);
 useEffect(()=>{void refresh();},[pathname,refresh]);
 useEffect(()=>{
  // Event editors keep their loaded version until save or navigation; public pages still receive broadcasts.
  if(pathname.startsWith("/admin/events"))return;
  try{const sync=listenForContentChanges(browserSupabase(),()=>refresh(true));contentSync.current=sync;return()=>{sync.dispose();contentSync.current=undefined;};}catch{}
 },[pathname,refresh]);
 useEffect(()=>{const onFocus=()=>void refresh();window.addEventListener("focus",onFocus);let cleanup=()=>{};try{const {data}=browserSupabase().auth.onAuthStateChange((event,session)=>{
  readVersion.current++;
  const email=session?.user.email?.toLowerCase()||"";
  if(event==="SIGNED_OUT"||(email&&email!==current.current.session.email)){
   authEpoch.current++;const empty=initialState();current.current=empty;revisions.current={};setState(empty);setReady(false);
  }
  setTimeout(()=>void refresh(),0);
 });cleanup=()=>data.subscription.unsubscribe()}catch{}
 return()=>{window.removeEventListener("focus",onFocus);cleanup();};},[refresh]);
 async function action(body:Record<string,unknown>){
  if(busy.current)return null;const epoch=authEpoch.current;readVersion.current++;busy.current=true;setSaving(true);setError("");
  try{const r=await fetch("/api/platform/actions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const data=await r.json();if(epoch!==authEpoch.current)return null;if(!r.ok)throw new Error(data.error?.message||"Perubahan belum tersimpan.");setReady(true);accept(data);return data.result||{};}catch(e){if(epoch===authEpoch.current)setError((e as Error).message);return null}finally{busy.current=false;setSaving(false);if(refreshAgain.current){refreshAgain.current=false;void refresh();}}
 }
 async function update(change:(draft:PlatformState)=>void){
  if(busy.current)return false;const next=structuredClone(current.current);change(next);
  if(current.current.session.loggedIn&&!next.session.loggedIn){try{await browserSupabase().auth.signOut();await refresh();return true}catch(e){setError((e as Error).message);return false}}
  const changes=changesBetween(current.current,next,revisions.current);if(!changes.length)return true;
  const epoch=authEpoch.current;readVersion.current++;busy.current=true;setSaving(true);setError("");
  try{const r=await fetch("/api/platform",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({changes})});const data=await r.json();if(epoch!==authEpoch.current)return false;if(!r.ok)throw new Error(data.error?.message||"Perubahan belum tersimpan.");setReady(true);accept(data);if(hasContentChanges(changes))contentSync.current?.notify();return true;}catch(e){if(epoch===authEpoch.current)setError((e as Error).message);return false}finally{busy.current=false;setSaving(false);if(refreshAgain.current){refreshAgain.current=false;void refresh();}}
 }
 return <Context.Provider value={{state,ready,saving,error,refresh,update,action}}>{children}{saving?<div role="status" className="save-status">Menyimpan…</div>:error?<div role="alert" className="save-status"><p>{error}</p><button type="button" className="mt-2 min-h-11 text-primary-700 underline" onClick={()=>void refresh()}>Coba lagi</button></div>:null}</Context.Provider>;
}

export function usePlatform(){const value=useContext(Context);if(!value)throw new Error("PlatformProvider diperlukan.");return value;}
