import {currentUser} from "@/lib/supabase/auth";
import {runAction} from "@/lib/server/actions";
import {requireUser} from "@/lib/server/platform";
import {sameOrigin,readBody,fail,json,rateLimit} from "@/lib/server/http";
export async function POST(request:Request){try{sameOrigin(request);const user=requireUser(await currentUser());await rateLimit("register:"+user.id,10);const input=await readBody(request,50000);return json({data:await runAction(user,{...input,type:"register"})},201);}catch(e){return fail(e)}}
