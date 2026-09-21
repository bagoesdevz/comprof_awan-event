"use client";
import Link from "next/link";
import { useState,type FormEvent } from "react";
import { browserSupabase } from "@/lib/supabase/client";
import { Field,Panel } from "@/components/platform/ui";
export function PasswordForm({reset=false}:{reset?:boolean}){
 const [busy,setBusy]=useState(false),[sent,setSent]=useState(false),[error,setError]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");const f=new FormData(e.currentTarget);try{const auth=browserSupabase().auth;const {error}=reset?await auth.updateUser({password:String(f.get("password"))}):await auth.resetPasswordForEmail(String(f.get("email")),{redirectTo:window.location.origin+"/auth/callback?next=/reset-password"});if(error)throw error;setSent(true)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <main className="grid min-h-dvh place-items-center bg-surface-base p-4"><div className="w-full max-w-md"><Panel><h1 className="text-3xl font-semibold">{reset?"Kata sandi baru":"Lupa kata sandi"}</h1>{sent?<p role="status" className="my-6">{reset?"Kata sandi diperbarui.":"Jika email terdaftar, tautan pemulihan akan dikirim."}</p>:<form className="mt-6 grid gap-5" onSubmit={submit}>{reset?<Field label="Kata sandi baru"><input name="password" type="password" minLength={8} maxLength={128} required autoComplete="new-password"/></Field>:<Field label="Email"><input name="email" type="email" required autoComplete="email"/></Field>}{error&&<p role="alert" className="flow-alert danger">{error}</p>}<button disabled={busy} className="flow-button">{busy?"Memproses…":reset?"Simpan kata sandi":"Kirim tautan pemulihan"}</button></form>}<Link className="mt-5 inline-flex min-h-11 items-center text-sm text-primary-700" href="/login">Kembali masuk</Link></Panel></div></main>;
}
