import {currentUser} from "@/lib/supabase/auth";
import {getServiceSupabaseClient} from "@/lib/supabase/server";
import {requireAdmin} from "@/lib/server/platform";
import {sameOrigin,fail,json,rateLimit,HttpError} from "@/lib/server/http";
export async function POST(request:Request){try{
 sameOrigin(request);const user=requireAdmin(await currentUser());await rateLimit("upload:"+user.id,20);
 if(Number(request.headers.get("content-length"))>5300000)throw new HttpError(413,"Ukuran gambar maksimal 5 MB.");
 const form=await request.formData(),file=form.get("file");if(!(file instanceof File)||file.size>5242880||file.size===0)throw new HttpError(422,"Pilih gambar PNG, JPG, atau WebP maksimal 5 MB.");
 const bytes=new Uint8Array(await file.arrayBuffer());const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71,jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255,webp=Buffer.from(bytes.slice(0,4)).toString()==="RIFF"&&Buffer.from(bytes.slice(8,12)).toString()==="WEBP";
 if(!png&&!jpg&&!webp)throw new HttpError(422,"Format gambar tidak didukung.");
 const extension=png?"png":jpg?"jpg":"webp",path=user.id+"/"+crypto.randomUUID()+"."+extension;
 const client=getServiceSupabaseClient();const {error}=await client.storage.from("event-assets").upload(path,bytes,{contentType:png?"image/png":jpg?"image/jpeg":"image/webp",upsert:false});if(error)throw error;
 return json({url:client.storage.from("event-assets").getPublicUrl(path).data.publicUrl},201);
 }catch(e){return fail(e)}}
