import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SupabaseConfigurationError } from "./server";
export async function sessionClient(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)throw new SupabaseConfigurationError();
 const jar=await cookies();
 return createServerClient(url,key,{cookies:{getAll:()=>jar.getAll(),setAll:(items)=>{try{items.forEach(({name,value,options})=>jar.set(name,value,options));}catch{/* Middleware refreshes Server Component cookies. */}}}});
}
export async function currentUser(){
 const client=await sessionClient();const {data,error}=await client.auth.getUser();
 if(error||!data.user)return null;
 return data.user;
}
