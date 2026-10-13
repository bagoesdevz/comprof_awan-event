"use client";
import {useState,type FormEvent} from "react";
import {usePlatform} from "@/components/platform/provider";
import {Badge,Empty,Field,PageHeading,Panel,exportCsv} from "@/components/platform/ui";
import {ParticipantsStudio} from "./participants-studio";
import {Transactions} from "./transactions";
import {UsersAdmin} from "./users";
const titles:Record<string,string>={waitlist:"Daftar tunggu",evaluations:"Evaluasi peserta",communications:"Draf pesan",leads:"Pengajuan program"};
export default function OperationsStudio({module}:{module:string}){
 if(module==="participants")return <ParticipantsStudio/>;
 if(module==="finance")return <Transactions/>;
 if(module==="settings")return <UsersAdmin/>;
 return <Operations module={module}/>;
}
function Operations({module}:{module:string}){
 const {state,update,saving,ready,error,refresh}=usePlatform();const [query,setQuery]=useState(""),[show,setShow]=useState(false);
 const cols=module==="waitlist"?["Nama","Event","Posisi","Status"]:module==="evaluations"?["Nama","Pre-test","Kehadiran","Post-test","Evaluasi acara"]:module==="leads"?["Nama","Kontak","Kebutuhan","Status"]:["Pesan","Event","Jadwal","Status"];
 const statusLabel=(status:string)=>({Queued:"Draf tersimpan",Sent:"Terkirim",Delivered:"Diterima",Failed:"Gagal",New:"Baru",Contacted:"Sudah dihubungi",Qualified:"Sesuai kebutuhan",Closed:"Ditutup",Waiting:"Menunggu",Offered:"Kursi ditawarkan",Confirmed:"Dikonfirmasi",Cancelled:"Dibatalkan"} as Record<string,string>)[status]||status;
 const all=module==="waitlist"?state.waitlist.map(r=>[r.name,r.eventSlug,String(r.position),statusLabel(r.status)]):module==="evaluations"?state.registrations.map(r=>[r.name,...(["pre-test","attendance","post-test","feedback"] as const).map(k=>r.progress[k]?"Selesai":"Belum selesai")]):module==="leads"?state.leads.map(r=>[r.name,r.email,r.message,statusLabel(r.status)]):state.campaigns.map(r=>[r.name,r.eventSlug,r.schedule,statusLabel(r.status)]);
 const rows=all.filter(r=>r.join(" ").toLowerCase().includes(query.toLowerCase()));
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const get=(name:string)=>String(f.get(name)||"");const saved=await update(s=>{if(module==="leads")s.leads.unshift({id:crypto.randomUUID(),name:get("name"),email:get("email"),phone:get("phone"),institution:get("institution"),kind:"program",message:get("message"),status:"New",pic:"",followUp:"",notes:"",history:[]});else s.campaigns.unshift({id:crypto.randomUUID(),name:get("name"),eventSlug:get("event"),audience:"Peserta lunas",templateId:"",body:get("message"),schedule:get("schedule"),status:"Queued",recipients:0})});if(saved)setShow(false);}
 if(!ready)return <p role="status">Memuat data…</p>;
 if(error)return <Panel title="Data belum dapat dimuat"><p role="alert">{error}</p><button className="flow-button secondary mt-4" onClick={()=>void refresh()}>Coba lagi</button></Panel>;
 return <div><PageHeading title={titles[module]||module} action={["leads","communications"].includes(module)?<button className="flow-button" onClick={()=>setShow(!show)}>{show?"Tutup":module==="leads"?"Tambah pengajuan":"Tambah draf pesan"}</button>:undefined}/>
 {module==="communications"&&<p className="mb-6 text-sm text-content-muted" role="status">Pesan hanya disimpan sebagai draf. Pengiriman pesan belum tersedia.</p>}
 {show&&<Panel title={module==="leads"?"Pengajuan baru":"Draf pesan baru"} className="mb-6"><form onSubmit={submit} className="grid gap-5 sm:grid-cols-2"><Field label={module==="leads"?"Nama":"Judul pesan"}><input name="name" required maxLength={160}/></Field>{module==="leads"?<><Field label="Email"><input name="email" type="email" required/></Field><Field label="WhatsApp"><input name="phone" type="tel"/></Field><Field label="Institusi"><input name="institution"/></Field></>:<><Field label="Event"><select name="event" required><option value="">Pilih event</option>{state.events.map(e=><option value={e.slug} key={e.id}>{e.title}</option>)}</select></Field><Field label="Rencana pengiriman"><input name="schedule" type="datetime-local" required/></Field></>}<Field label="Pesan" className="sm:col-span-2"><textarea name="message" required rows={4} maxLength={3000}/></Field><button className="flow-button" disabled={saving}>{module==="communications"?"Simpan draf":"Simpan pengajuan"}</button></form></Panel>}
 <Panel><div className="mb-6 grid items-end gap-4 sm:grid-cols-[1fr_auto]"><Field label="Cari data"><input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></Field><button className="flow-button secondary" onClick={()=>exportCsv(module,cols,rows)}>Ekspor CSV</button></div>{rows.length?<div className="flow-table-wrap"><table className="flow-table"><thead><tr>{cols.map(v=><th key={v}>{v}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table></div>:<><Empty title={query.trim()?"Tidak ada hasil untuk pencarian ini":"Belum ada data"}/>{!!query.trim()&&rows.length===0&&<button className="flow-button secondary mt-4" onClick={()=>setQuery("")}>Hapus pencarian</button>}</>}</Panel></div>;
}
