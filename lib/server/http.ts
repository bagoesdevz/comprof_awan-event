import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SupabaseConfigurationError,getServiceSupabaseClient } from "@/lib/supabase/server";
export class HttpError extends Error { constructor(public status:number,message:string){super(message)} }
export function fail(error:unknown){
 if(error instanceof HttpError)return NextResponse.json({error:{message:error.message}},{status:error.status});
 if(error instanceof z.ZodError)return NextResponse.json({error:{message:"Periksa data yang diisi.",details:error.issues.map(i=>({field:i.path.join("."),message:i.message}))}},{status:422});
 if(error instanceof SupabaseConfigurationError)return NextResponse.json({error:{message:"Layanan belum tersedia. Silakan coba lagi nanti."}},{status:503});
 console.error("Request failed",error instanceof Error?error.message:"unknown");
 return NextResponse.json({error:{message:"Perubahan belum tersimpan. Silakan coba lagi."}},{status:500});
}
export function sameOrigin(request:Request){
 const origin=request.headers.get("origin");
 if(!origin||origin!==new URL(request.url).origin)throw new HttpError(403,"Permintaan tidak diizinkan.");
}
export async function readBody(request:Request,limit=1500000){
 const text=await request.text();if(new TextEncoder().encode(text).length>limit)throw new HttpError(413,"Data terlalu besar.");
 try{return JSON.parse(text)}catch{throw new HttpError(400,"Data tidak valid.")}
}
export async function rateLimit(key:string,limit=60,seconds=60){
 const {data,error}=await getServiceSupabaseClient().rpc("consume_api_limit",{p_key:key,p_limit:limit,p_seconds:seconds});
 if(error)throw new Error("Rate limiter unavailable");
 if(!data)throw new HttpError(429,"Terlalu banyak permintaan. Coba lagi sebentar.");
}
export function json(data:unknown,status=200){return NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store"}})}
