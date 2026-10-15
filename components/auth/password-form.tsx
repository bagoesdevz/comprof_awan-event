"use client";
import Link from "next/link";
import { useEffect,useState,type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authErrorMessage } from "@/lib/auth-errors";
import { browserSupabase } from "@/lib/supabase/client";
import { Field,Panel } from "@/components/platform/ui";
import { authEmailRedirectUrl } from "@/lib/auth-redirect";
export function PasswordForm({reset=false}:{reset?:boolean}){
 const router=useRouter();
 const [busy,setBusy]=useState(false),[sent,setSent]=useState(false),[error,setError]=useState("");
 const [sessionStatus,setSessionStatus]=useState<"checking"|"ready"|"invalid"|"unavailable">(reset?"checking":"ready");
 const [checkAttempt,setCheckAttempt]=useState(0);
 useEffect(()=>{
  if(!reset){const code=new URLSearchParams(window.location.search).get("error");if(code==="recovery")setError("Tautan pemulihan sudah kedaluwarsa atau tidak valid. Minta tautan baru di bawah ini.");else if(code==="browser")setError("Buka tautan pada browser tempat Anda meminta pemulihan, atau minta tautan baru dari browser ini.");else if(code==="service")setError("Layanan pemulihan belum dapat dihubungi. Silakan coba kirim tautan baru.");return;}
  let cancelled=false;setSessionStatus("checking");
  async function check(){try{const {data,error}=await browserSupabase().auth.getUser();if(cancelled)return;if(data.user&&!error)setSessionStatus("ready");else setSessionStatus(!error||error.status===401||error.status===403||error.code==="session_not_found"||error.name==="AuthSessionMissingError"?"invalid":"unavailable");}catch{if(!cancelled)setSessionStatus("unavailable");}}
  void check();return()=>{cancelled=true;};
 },[reset,checkAttempt]);
 async function returnToLogin(){
  setBusy(true);setError("");
  try{const {error}=await browserSupabase().auth.signOut({scope:"local"});if(error)throw error;router.replace("/login?reset=success");router.refresh();}
  catch{setError("Kata sandi sudah diperbarui, tetapi sesi belum dapat ditutup. Coba lagi untuk kembali ke halaman masuk.");}
  finally{setBusy(false);}
 }
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(reset&&sessionStatus!=="ready")return;setBusy(true);setError("");const f=new FormData(e.currentTarget);
  try{
   const auth=browserSupabase().auth;
   if(reset){const {error}=await auth.updateUser({password:String(f.get("password"))});if(error)throw error;setSent(true);await returnToLogin();}
   else{const {error}=await auth.resetPasswordForEmail(String(f.get("email")).trim().toLowerCase(),{redirectTo:authEmailRedirectUrl("recovery")});if(error)throw error;setSent(true);}
  }catch(e){setError(authErrorMessage(e));}finally{setBusy(false);}
 }
 return <main className="grid min-h-dvh place-items-center bg-surface-base p-4"><div className="w-full max-w-md"><Panel>
  <h1 className="text-3xl font-semibold">{reset?"Kata sandi baru":"Lupa kata sandi"}</h1>
  {reset&&sessionStatus==="checking"?<p role="status" className="my-6 text-sm">Memeriksa tautan pemulihan…</p>:reset&&sessionStatus!=="ready"?<div className="my-6 grid gap-4">
   <p role="alert" className="text-sm leading-7">{sessionStatus==="invalid"?"Tautan pemulihan sudah tidak berlaku atau belum dibuka. Minta tautan baru untuk mengubah kata sandi.":"Tautan pemulihan belum dapat diperiksa. Periksa koneksi lalu coba lagi."}</p>
   {sessionStatus==="unavailable"?<button className="flow-button" onClick={()=>setCheckAttempt(value=>value+1)}>Periksa lagi</button>:<Link className="flow-button" href="/forgot-password">Minta tautan pemulihan baru</Link>}
  </div>:sent?<div className="my-6 grid gap-4"><p role="status" className="text-sm leading-7">{reset?"Kata sandi diperbarui. Mengarahkan ke halaman masuk…":"Jika email terdaftar, tautan pemulihan akan dikirim. Buka email terbaru untuk membuat kata sandi baru."}</p>{reset&&error&&<button className="flow-button" disabled={busy} onClick={()=>void returnToLogin()}>{busy?"Memproses…":"Coba kembali ke halaman masuk"}</button>}</div>:<form className="mt-6 grid gap-5" onSubmit={submit}>
   {reset?<Field label="Kata sandi baru" hint="Gunakan 8 sampai 128 karakter."><input name="password" type="password" minLength={8} maxLength={128} required autoComplete="new-password"/></Field>:<Field label="Email"><input name="email" type="email" required autoComplete="email"/></Field>}
   <button disabled={busy} className="flow-button">{busy?"Memproses…":reset?"Simpan kata sandi":"Kirim tautan pemulihan"}</button>
  </form>}
  {error&&<p role="alert" className="flow-alert danger mt-5">{error}</p>}
  <Link className="mt-5 inline-flex min-h-11 items-center text-sm text-primary-700" href="/login">Kembali ke halaman masuk</Link>
 </Panel></div></main>;
}
