import { createBrowserClient } from "@supabase/ssr";
export function browserSupabase(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)throw new Error("Layanan akun belum tersedia. Silakan coba lagi nanti.");
 return createBrowserClient(url,key);
}
