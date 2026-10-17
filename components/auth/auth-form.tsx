"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect,useState,type FormEvent } from "react";
import { Eye,EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/platform/ui";
import { usePlatform } from "@/components/platform/provider";
import { browserSupabase } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth-errors";
import { safeNext } from "@/lib/platform-model";
import { authEmailRedirectUrl } from "@/lib/auth-redirect";
export function AuthForm({mode}:{mode:"login"|"register"}){
 const router=useRouter(),{refresh}=usePlatform();const [busy,setBusy]=useState(false),[error,setError]=useState(""),[sent,setSent]=useState(false),[show,setShow]=useState(false);
 const [notice,setNotice]=useState(""),[confirmationHelp,setConfirmationHelp]=useState(false),[confirmationEmail,setConfirmationEmail]=useState("");
 useEffect(()=>{const query=new URLSearchParams(window.location.search);if(query.get("error")==="confirmation"){setError("Tautan konfirmasi sudah kedaluwarsa atau tidak valid. Isi email untuk meminta tautan baru.");setConfirmationHelp(true);}else if(query.get("error")==="browser"){setError("Buka tautan pada browser yang digunakan saat mendaftar. Anda juga dapat mengisi email untuk mengirim ulang konfirmasi dari browser ini.");setConfirmationHelp(true);}else if(query.get("error")==="service"){setError("Layanan konfirmasi belum dapat dihubungi. Coba masuk atau kirim ulang tautan.");setConfirmationHelp(true);}if(query.get("confirmed")==="1")setNotice("Email berhasil dikonfirmasi. Silakan masuk dengan akun Anda.");if(query.get("reset")==="success")setNotice("Kata sandi berhasil diperbarui. Silakan masuk dengan kata sandi baru.");},[]);
 async function resendConfirmation(email:string){setBusy(true);setError("");setNotice("");try{const {error}=await browserSupabase().auth.resend({type:"signup",email:email.trim().toLowerCase(),options:{emailRedirectTo:authEmailRedirectUrl("signup")}});if(error)throw error;setNotice("Jika akun memerlukan konfirmasi, tautan baru akan dikirim. Gunakan email yang paling baru.");}catch(e){setError(authErrorMessage(e));}finally{setBusy(false);}}
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError("");const f=new FormData(e.currentTarget),email=String(f.get("email")).trim().toLowerCase(),password=String(f.get("password"));
  try{const auth=browserSupabase().auth;
   if(mode==="register"){const {data,error}=await auth.signUp({email,password,options:{data:{name:String(f.get("name"))},emailRedirectTo:authEmailRedirectUrl("signup")}});if(error)throw error;if(!data.session){setConfirmationEmail(email);setSent(true);return;}}
   else {const {error}=await auth.signInWithPassword({email,password});if(error)throw error;}
   const state=await refresh();if(!state?.session.loggedIn)throw new Error("Sesi belum dapat dimuat. Coba masuk kembali.");
   const next=safeNext(new URLSearchParams(window.location.search).get("next"));router.replace(state.session.role!=="participant"?(next.startsWith("/admin")?next:"/admin"):next.startsWith("/admin")?"/dashboard":mode==="register"?"/dashboard/profile?required=1":next);router.refresh();
  }catch(e){setError(authErrorMessage(e));if((e as {code?:string}).code==="email_not_confirmed")setConfirmationHelp(true);}finally{setBusy(false)}
 }
 if(sent)return <div><h2 className="text-xl font-semibold">Periksa email Anda</h2><p role="status" className="my-4 text-sm">Buka tautan konfirmasi terbaru untuk mengaktifkan akun. Setelah dikonfirmasi, Anda diarahkan ke halaman masuk.</p>{notice&&<p role="status" className="flow-alert success mb-4">{notice}</p>}{error&&<p role="alert" className="flow-alert danger mb-4">{error}</p>}<div className="flex flex-wrap gap-3"><Link href="/login" className="flow-button">Kembali ke halaman masuk</Link><button type="button" className="flow-button secondary" disabled={busy} onClick={()=>void resendConfirmation(confirmationEmail)}>{busy?"Mengirim…":"Kirim ulang konfirmasi"}</button></div></div>;
 return <form onSubmit={submit} className="auth-form">
 {notice&&<p role="status" className="flow-alert success">{notice}</p>}
 {mode==="register"&&<Field label="Nama lengkap"><input name="name" autoComplete="name" required minLength={2} maxLength={160}/></Field>}
 <Field label="Email"><input name="email" type="email" autoComplete="email" required maxLength={254}/></Field>
 <div className="flow-field"><label htmlFor="auth-password">Kata sandi</label><span className="auth-password-field"><input id="auth-password" name="password" type={show?"text":"password"} required minLength={8} maxLength={128} autoComplete={mode==="login"?"current-password":"new-password"}/><button type="button" aria-label={show?"Sembunyikan kata sandi":"Tampilkan kata sandi"} aria-pressed={show} onClick={()=>setShow(!show)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></span>{mode==="register"&&<small>Gunakan 8 sampai 128 karakter.</small>}</div>
 {mode==="register"&&<label className="auth-consent"><input type="checkbox" required/><span>Saya menyetujui penggunaan data untuk pendaftaran event dan sertifikat.</span></label>}
 {error&&<p role="alert" className="flow-alert danger">{error}</p>}<Button type="submit" loading={busy} className="flow-button auth-submit">{mode==="login"?"Masuk":"Buat akun"}</Button>
 {mode==="login"&&confirmationHelp&&<button type="button" className="flow-button secondary" disabled={busy} onClick={event=>{const input=event.currentTarget.form?.elements.namedItem("email") as HTMLInputElement|null;if(input?.reportValidity())void resendConfirmation(input.value);}}>Kirim ulang konfirmasi</button>}
 <div className="auth-form-links"><Link href={mode==="login"?"/register-account":"/login"}>{mode==="login"?"Buat akun":"Sudah punya akun? Masuk"}</Link>{mode==="login"&&<Link href="/forgot-password">Lupa sandi?</Link>}</div></form>;
}
