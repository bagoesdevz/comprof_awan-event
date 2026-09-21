export async function readImage(file:File):Promise<string>{
 if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>5242880)throw new Error("Gunakan PNG, JPG, atau WebP maksimal 5 MB.");
 const form=new FormData();form.set("file",file);const r=await fetch("/api/admin/uploads",{method:"POST",body:form});const data=await r.json();if(!r.ok)throw new Error(data.error?.message||"Gambar belum terunggah. Coba lagi.");return data.url;
}
