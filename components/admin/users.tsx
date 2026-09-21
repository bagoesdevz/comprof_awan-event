"use client";
import {useEffect,useState,type FormEvent} from "react";
import {PageHeading,Panel,Field,Empty} from "@/components/platform/ui";
type Account={id:string;email:string;name:string;role:string};
export function UsersAdmin(){
 const [users,setUsers]=useState<Account[]>([]),[error,setError]=useState(""),[busy,setBusy]=useState(false),[open,setOpen]=useState(false);
 async function load(){try{const r=await fetch("/api/admin/users");const data=await r.json();if(!r.ok)throw new Error(data.error?.message);setUsers(data.users)}catch(e){setError((e as Error).message)}}
 useEffect(()=>{void load()},[]);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");const body=Object.fromEntries(new FormData(e.currentTarget));try{const r=await fetch("/api/admin/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw new Error(data.error?.message);setOpen(false);await load()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <div><PageHeading title="Pengguna" action={<button className="flow-button" onClick={()=>setOpen(!open)}>Undang pengguna</button>}/>{error&&<p className="flow-alert danger mb-5" role="alert">{error}</p>}{open&&<Panel className="mb-6"><form className="grid gap-5 sm:grid-cols-2" onSubmit={submit}><Field label="Email"><input type="email" name="email" required/></Field><Field label="Peran"><select name="role"><option value="participant">Peserta</option><option value="operational">Admin operasional</option><option value="super">Super admin</option></select></Field><button className="flow-button" disabled={busy}>{busy?"Mengirim…":"Kirim undangan"}</button></form></Panel>}<Panel>{users.length?<div className="flow-table-wrap"><table className="flow-table"><thead><tr><th>Nama</th><th>Email</th><th>Peran</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td>{u.name||"—"}</td><td>{u.email}</td><td>{u.role==="super"?"Super admin":u.role==="operational"?"Admin operasional":"Peserta"}</td></tr>)}</tbody></table></div>:<Empty title="Belum ada pengguna"/>}</Panel></div>;
}
