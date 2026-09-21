"use client";
import {useState,type FormEvent} from "react";
import {usePlatform} from "@/components/platform/provider";
import {PageHeading,Panel,Field} from "@/components/platform/ui";
export default function Page(){
 const {state,action,saving}=usePlatform();const [code,setCode]=useState(""),[event,setEvent]=useState(""),[message,setMessage]=useState("");
 async function submit(e:FormEvent){e.preventDefault();setMessage("");const result=await action({type:"check-in",id:code.trim().toUpperCase(),eventSlug:event});if(result){setMessage(String(result.message));setCode("")}}
 return <div className="max-w-3xl"><PageHeading title="Check-in peserta"/><Panel><form onSubmit={submit} className="grid gap-5"><Field label="Event"><select value={event} onChange={e=>setEvent(e.target.value)} required><option value="">Pilih event</option>{state.events.map(e=><option key={e.id} value={e.slug}>{e.title}</option>)}</select></Field><Field label="Kode tiket"><input value={code} onChange={e=>setCode(e.target.value)} required autoComplete="off" placeholder="AWN-…" maxLength={64}/></Field><button className="flow-button" disabled={saving}>{saving?"Memeriksa…":"Catat kehadiran"}</button>{message&&<p role="status" className="flow-alert success">{message}</p>}</form></Panel></div>;
}
