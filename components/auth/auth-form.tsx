"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState,type FormEvent } from "react";
import { Eye,EyeOff } from "lucide-react";
import { Field } from "@/components/platform/ui";
import { usePlatform } from "@/components/platform/provider";
import { browserSupabase } from "@/lib/supabase/client";
import { safeNext } from "@/lib/platform-model";
export function AuthForm({mode}:{mode:"login"|"register"}){
 const router=useRouter(),{refresh}=usePlatform();const [busy,setBusy]=useState(false),[error,setError]=useState(""),[sent,setSent]=useState(false),[show,setShow]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError("");const f=new FormData(e.currentTarget),email=String(f.get("email")).trim().toLowerCase(),password=String(f.get("password"));
  try{const auth=browserSupabase().auth;
   if(mode==="register"){const {data,error}=await auth.signUp({email,password,options:{data:{name:String(f.get("name"))},emailRedirectTo:window.location.origin+"/auth/callback"}});if(error)throw error;if(!data.session){setSent(true);return;}}
   else {const {error}=await auth.signInWithPassword({email,password});if(error)throw error;}
   const state=await refresh();if(!state?.session.loggedIn)throw new Error("Sesi belum dapat dimuat. Coba masuk kembali.");
   const next=safeNext(new URLSearchParams(window.location.search).get("next"));router.replace(state.session.role!=="participant"?(next.startsWith("/admin")?next:"/admin"):next.startsWith("/admin")?"/dashboard":mode==="register"?"/dashboard/profile?required=1":next);router.refresh();
  }catch(e){const message=(e as Error).message;setError(/invalid login/i.test(message)?"Email atau kata sandi salah.":/email not confirmed/i.test(message)?"Konfirmasi email Anda terlebih dahulu.":/already registered/i.test(message)?"Email sudah terdaftar. Silakan masuk.":message)}finally{setBusy(false)}
 }
 if(sent)return <div role="status"><h2 className="text-xl font-semibold">Periksa email Anda</h2><p className="my-4 text-sm">Buka tautan konfirmasi untuk mengaktifkan akun.</p><Link href="/login" className="flow-button">Kembali masuk</Link></div>;
 return <form onSubmit={submit} className="auth-form">
 {mode==="register"&&<Field label="Nama lengkap"><input name="name" autoComplete="name" required minLength={2} maxLength={160}/></Field>}
 <Field label="Email"><input name="email" type="email" autoComplete="email" required maxLength={254}/></Field>
 <div className="flow-field"><label htmlFor="auth-password">Kata sandi</label><span className="auth-password-field"><input id="auth-password" name="password" type={show?"text":"password"} required minLength={8} maxLength={128} autoComplete={mode==="login"?"current-password":"new-password"}/><button type="button" aria-label={show?"Sembunyikan kata sandi":"Tampilkan kata sandi"} aria-pressed={show} onClick={()=>setShow(!show)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></span></div>
 {mode==="register"&&<label className="auth-consent"><input type="checkbox" required/><span>Saya menyetujui penggunaan data untuk pendaftaran event dan sertifikat.</span></label>}
 {error&&<p role="alert" className="flow-alert danger">{error}</p>}<button disabled={busy} className="flow-button auth-submit">{busy?"Memproses…":mode==="login"?"Masuk":"Buat akun"}</button>
 <div className="auth-form-links"><Link href={mode==="login"?"/register-account":"/login"}>{mode==="login"?"Buat akun":"Sudah punya akun? Masuk"}</Link>{mode==="login"&&<Link href="/forgot-password">Lupa sandi?</Link>}</div></form>;
}
