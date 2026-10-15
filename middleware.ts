import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { isEventPublicCode } from "@/lib/event-sharing";
import { publicEventLinkStatus } from "@/lib/public-event-link-status";
import { publicEventUnavailable } from "@/lib/public-event-unavailable";
import { AUTH_SITE_URL } from "@/lib/auth-redirect";
import { NextResponse,type NextRequest } from "next/server";
export async function middleware(request:NextRequest){
 let response=NextResponse.next({request});
 if(request.nextUrl.pathname==="/"){
  if(request.nextUrl.searchParams.get("error")==="access_denied"||request.nextUrl.searchParams.get("error_code")==="otp_expired"){
   const redirect=NextResponse.redirect(new URL("/login?error=confirmation",AUTH_SITE_URL),303);
   redirect.headers.set("Cache-Control","private, no-store");redirect.headers.set("Referrer-Policy","no-referrer");return redirect;
  }
  return response;
 }
 if(request.nextUrl.pathname.startsWith("/e/")){
  const code=request.nextUrl.pathname.slice(3);
  const unavailable=publicEventUnavailable;
  if(!isEventPublicCode(code))return unavailable(404);
  const serviceUrl=process.env.SUPABASE_URL??process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey=process.env.SUPABASE_SECRET_KEY??process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!serviceUrl||!serviceKey)return unavailable(503);
  try{
   const service=createClient(serviceUrl,serviceKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
   const status=await publicEventLinkStatus(service,code);
   if(status!==200)return unavailable(status);
   response.headers.set("Cache-Control","private, no-store");return response;
  }catch{return unavailable(503);}
 }
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 const protectedPage=request.nextUrl.pathname.startsWith("/admin")||request.nextUrl.pathname.startsWith("/dashboard");
 const redirect=(path:string)=>{const next=NextResponse.redirect(new URL(path,request.url));response.cookies.getAll().forEach(cookie=>next.cookies.set(cookie));next.headers.set("Cache-Control","private, no-store");return next};
 if(!url||!key)return protectedPage?redirect("/login?next="+encodeURIComponent(request.nextUrl.pathname)):response;
 const client=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll:(items)=>{items.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});items.forEach(({name,value,options})=>response.cookies.set(name,value,options));}}});
 const {data:{user}}=await client.auth.getUser();
 if(protectedPage&&!user)return redirect("/login?next="+encodeURIComponent(request.nextUrl.pathname));
 if(request.nextUrl.pathname.startsWith("/admin")&&!["super","operational"].includes(user?.app_metadata?.role))return redirect("/dashboard");
 if(protectedPage||request.nextUrl.pathname.startsWith("/api/platform"))response.headers.set("Cache-Control","private, no-store");
 return response;
}
export const config={matcher:["/","/admin/:path*","/dashboard/:path*","/api/platform/:path*","/auth/:path*","/e/:path*"]};
