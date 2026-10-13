import {z} from "zod";
import {verifySignature,reconcilePayment} from "@/lib/server/payments";
import {readBody,fail,json} from "@/lib/server/http";
const schema=z.object({order_id:z.string().regex(/^AWN-[A-Z0-9]{10,32}$/),status_code:z.string().regex(/^\d{3}$/),gross_amount:z.string().max(30).regex(/^\d+(\.\d{1,2})?$/),signature_key:z.string().regex(/^[a-f0-9]{128}$/i)});
export async function POST(request:Request){try{const input=schema.parse(await readBody(request,20000));verifySignature(input);await reconcilePayment(input.order_id);return json({ok:true});}catch(e){return fail(e)}}
