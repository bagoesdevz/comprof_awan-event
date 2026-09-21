import { createServerClient } from "@supabase/ssr";
import { NextResponse,type NextRequest } from "next/server";
export async function middleware(request:NextRequest){
 let response=NextResponse.next({request});
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
export const config={matcher:["/admin/:path*","/dashboard/:path*","/api/platform/:path*","/auth/:path*"]};
