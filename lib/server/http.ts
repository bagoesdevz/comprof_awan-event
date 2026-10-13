import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SupabaseConfigurationError,getServiceSupabaseClient } from "@/lib/supabase/server";
export class HttpError extends Error { constructor(public status:number,message:string){super(message)} }
export function fail(error:unknown){
 if(error instanceof HttpError)return json({error:{message:error.message}},error.status);
 if(error instanceof z.ZodError)return json({error:{message:"Periksa data yang diisi.",details:error.issues.map(i=>({field:i.path.join("."),message:i.message}))}},422);
 if(error instanceof SupabaseConfigurationError)return json({error:{message:"Layanan belum tersedia. Silakan coba lagi nanti."}},503);
 const requestId=crypto.randomUUID();
 console.error("Request failed",{requestId,type:error instanceof Error?error.name:"unknown"});
 return json({error:{message:"Perubahan belum tersimpan. Silakan coba lagi.",requestId}},500);
}
export function sameOrigin(request:Request){
 const origin=request.headers.get("origin");
 if(!origin||origin!==new URL(request.url).origin)throw new HttpError(403,"Permintaan tidak diizinkan.");
}
export async function readBytes(request:Pick<Request,"headers"|"body">,limit=1500000){
 const length=Number(request.headers.get("content-length"));
 if(Number.isFinite(length)&&length>limit)throw new HttpError(413,"Data terlalu besar.");
 if(!request.body)throw new HttpError(400,"Data tidak valid.");
 const reader=request.body.getReader();
 let size=0;const chunks:Uint8Array[]=[];
 try{
  while(true){
   const {done,value}=await reader.read();
   if(done)break;
   size+=value.byteLength;
   if(size>limit){await reader.cancel();throw new HttpError(413,"Data terlalu besar.");}
   chunks.push(value);
  }
 }catch(error){
  if(error instanceof HttpError)throw error;
  throw new HttpError(400,"Data tidak valid.");
 }finally{reader.releaseLock();}
 return Buffer.concat(chunks);
}
export async function readBody(request:Request,limit=1500000){
 const bytes=await readBytes(request,limit);
 try{return JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes))}catch{throw new HttpError(400,"Data tidak valid.")}
}
export async function rateLimit(key:string,limit=60,seconds=60){
 const {data,error}=await getServiceSupabaseClient().rpc("consume_api_limit",{p_key:key,p_limit:limit,p_seconds:seconds});
 if(error)throw new Error("Rate limiter unavailable");
 if(!data)throw new HttpError(429,"Terlalu banyak permintaan. Coba lagi sebentar.");
}
export function json(data:unknown,status=200){return NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store"}})}
