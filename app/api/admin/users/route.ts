import {z} from "zod";
import {currentUser} from "@/lib/supabase/auth";
import {getServiceSupabaseClient} from "@/lib/supabase/server";
import {requireAdmin,roleOf} from "@/lib/server/platform";
import {sameOrigin,readBody,fail,json,rateLimit} from "@/lib/server/http";
export async function GET(){try{requireAdmin(await currentUser(),true);const {data,error}=await getServiceSupabaseClient().auth.admin.listUsers({page:1,perPage:100});if(error)throw error;return json({users:data.users.map(u=>({id:u.id,email:u.email,name:String(u.user_metadata.name||""),role:roleOf(u)}))});}catch(e){return fail(e)}}
export async function POST(request:Request){try{sameOrigin(request);const admin=requireAdmin(await currentUser(),true);await rateLimit("invite:"+admin.id,10);const input=z.object({email:z.string().email(),role:z.enum(["participant","operational","super"])}).parse(await readBody(request,5000));const client=getServiceSupabaseClient();const {data,error}=await client.auth.admin.inviteUserByEmail(input.email,{redirectTo:new URL("/auth/callback?next=/reset-password",request.url).href});if(error)throw error;const result=await client.auth.admin.updateUserById(data.user.id,{app_metadata:{role:input.role}});if(result.error)throw result.error;return json({ok:true},201);}catch(e){return fail(e)}}
