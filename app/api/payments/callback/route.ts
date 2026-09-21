import {z} from "zod";
import {verifySignature,reconcilePayment} from "@/lib/server/payments";
import {readBody,fail,json} from "@/lib/server/http";
const schema=z.object({order_id:z.string().max(64),status_code:z.string().max(5),gross_amount:z.string().max(30),signature_key:z.string().max(128)});
export async function POST(request:Request){try{const input=schema.parse(await readBody(request,20000));verifySignature(input);await reconcilePayment(input.order_id);return json({ok:true});}catch(e){return fail(e)}}
