import { z } from "zod";
const text=z.string().trim().max(10000),short=z.string().trim().max(254);
const image=z.string().max(2048).refine(v=>!v||v.startsWith("/")&&!v.startsWith("//")||/^https:\/\//.test(v),"URL gambar tidak valid.");
const timestamp=z.string().refine(v=>!v||Number.isFinite(Date.parse(v)),"Tanggal tidak valid.");
const question=z.object({id:short.min(1),text:text.min(1),options:z.array(short.min(1)).min(2).max(8),correct:z.number().int().min(0),score:z.number().min(1).max(100)}).refine(q=>q.correct<q.options.length);
const assessment=z.object({enabled:z.boolean(),questions:z.array(question).max(100),passingScore:z.number().min(0).max(100),attempts:z.number().int().min(1).max(20),timeLimit:z.number().int().min(1).max(300)}).refine(a=>!a.enabled||a.questions.length>0,"Tambahkan soal evaluasi.");
export const eventSchema=z.object({
 id:short.min(1),slug:z.string().max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),title:short.min(3),
 programType:z.enum(["Webinar","Seminar","Pelatihan","Workshop"]),type:z.enum(["ONLINE","ONSITE","HYBRID"]),
 publication:z.enum(["draft","published"]),lifecycle:z.enum(["upcoming","ongoing","completed"]),
 category:short,summary:text,description:text,audience:text,startAt:timestamp,endAt:timestamp,
 capacity:z.number().int().min(1),price:z.number().int().min(0),credits:z.number().int().min(0),
 duration:short,city:short,venue:short,speaker:short,quotaLeft:z.number().int().min(0),
 registrationStatus:z.enum(["OPEN","COMING_SOON","SOLD_OUT","CLOSED"]),waitlist:z.boolean(),
 speakers:z.array(z.object({name:short,role:short,organization:short,bio:text,photo:image.optional()})).max(50),
 tickets:z.array(z.object({id:short.min(1),name:short.min(1),attendance:z.enum(["ONLINE","ONSITE"]),price:z.number().int().min(0),quota:z.number().int().min(1),quotaLeft:z.number().int().min(0),benefits:z.array(short),startsAt:timestamp.optional(),endsAt:timestamp.optional(),quantityLimit:z.number().int().min(1).max(50).optional(),status:z.enum(["active","inactive"]).optional(),pricingMode:z.enum(["free","paid"]).optional()}).refine(t=>t.pricingMode!=="free"||t.price===0,"Tiket gratis harus bernilai nol.")).max(30),
 blocks:z.array(z.object({id:short,type:short,title:short,body:text,visible:z.boolean(),image:image.optional()})).max(50),
 preTest:assessment,postTest:assessment,meetingProvider:z.enum(["Zoom","Google Meet"]),
 meetingUrl:z.string().max(2048).refine(v=>!v||/^https:\/\/([a-z0-9-]+\.)?zoom\.us\//i.test(v)||/^https:\/\/meet\.google\.com\//i.test(v),"Gunakan link Zoom atau Google Meet."),
 meetingId:short,meetingPasscode:short,accessOpensAt:timestamp,
 certificateEnabled:z.boolean(),certificatePattern:short.min(1),certificateTemplate:image,
 certificatePlacement:z.object({name:z.object({x:z.number().min(0).max(100),y:z.number().min(0).max(100),size:z.number().min(8).max(120),color:z.string().regex(/^#[0-9a-f]{6}$/i)}),number:z.object({x:z.number().min(0).max(100),y:z.number().min(0).max(100),size:z.number().min(8).max(120),color:z.string().regex(/^#[0-9a-f]{6}$/i)})}),
 reminder:short,banner:image,customFields:z.array(z.object({id:short,label:short.min(1),required:z.boolean()})).max(30),
 learningOutcomes:z.array(text),sessions:z.array(z.object({time:short,title:short,note:text})),
 objectives:text.optional(),learningMethods:z.array(short).optional(),partner:short.optional(),coordinator:short.optional(),requirements:text.optional(),evaluationPlan:text.optional(),documentationPlan:text.optional(),venueAddress:text.optional(),mapLabel:short.optional(),detailRevision:z.number().optional()
}).refine(e=>Number.isFinite(Date.parse(e.startAt))&&Date.parse(e.endAt)>Date.parse(e.startAt),"Waktu selesai harus setelah waktu mulai.")
 .refine(e=>e.publication!=="published"||e.tickets.length>0,"Tambahkan tiket sebelum menerbitkan.")
 .refine(e=>new Set(e.tickets.map(t=>t.id)).size===e.tickets.length,"ID tiket harus unik.")
 .refine(e=>!e.certificateEnabled||!!e.certificateTemplate,"Unggah template sertifikat.");
export const profileSchema=z.object({name:short.min(2),email:z.string().email(),phone:short.min(8),gender:z.enum(["male","female","prefer_not_to_say"]),birthPlace:short.min(2),birthDate:timestamp,profession:short.min(2),institution:short,city:short.min(2),address:text,province:short,position:short,category:short,specialization:short,source:short.min(1)});
export const contentSchema=z.object({title:short.min(1),body:text,image,status:z.enum(["Draft","Published"])});
export const articleSchema=z.object({id:short,slug:z.string().regex(/^[a-z0-9-]+$/),title:short.min(1),category:short,cover:image,content:text,excerpt:text,author:short,seoTitle:short,seoDescription:text,publishDate:timestamp,status:z.enum(["Draft","Review","Published","Archived"])});
export const leadSchema=z.object({id:short,name:short.min(2),email:z.string().email(),phone:short,institution:short,kind:short,message:text,status:short,pic:short,followUp:short,notes:text,history:z.array(short)});
export const templateSchema=z.object({id:short,name:short,category:short,body:text,active:z.boolean()});
export const campaignSchema=z.object({id:short,name:short,eventSlug:short,audience:short,templateId:short,body:text,schedule:timestamp,status:z.literal("Queued"),recipients:z.literal(0)});
