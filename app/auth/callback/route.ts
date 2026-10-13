import { NextResponse } from "next/server";
import { sessionClient } from "@/lib/supabase/auth";
import { safeNext } from "@/lib/platform-model";
import { fail } from "@/lib/server/http";
export async function GET(request:Request){
 const url=new URL(request.url),code=url.searchParams.get("code"),token=url.searchParams.get("token_hash"),type=url.searchParams.get("type");
 try{
 const client=await sessionClient();
 if(code){const {error}=await client.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(safeNext(url.searchParams.get("next")),url.origin));}
 if(token&&(type==="email"||type==="recovery"||type==="signup"||type==="invite")){const {error}=await client.auth.verifyOtp({token_hash:token,type});if(!error)return NextResponse.redirect(new URL(type==="recovery"||type==="invite"?"/reset-password":"/dashboard/profile?required=1",url.origin));}
 return NextResponse.redirect(new URL("/login?error=confirmation",url.origin));
 }catch(error){return fail(error);}
}
