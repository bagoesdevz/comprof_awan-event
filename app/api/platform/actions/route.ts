import {currentUser} from "@/lib/supabase/auth";
import {snapshot,requireUser} from "@/lib/server/platform";
import {runAction} from "@/lib/server/actions";
import {sameOrigin,readBody,fail,json,rateLimit} from "@/lib/server/http";
export async function POST(request:Request){try{sameOrigin(request);const user=requireUser(await currentUser());await rateLimit("action:"+user.id);const result=await runAction(user,await readBody(request,50000));return json({...await snapshot(user),result});}catch(e){return fail(e)}}
