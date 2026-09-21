import { manageEvent } from "@/lib/platform-model";
// The only illustrative record. Seed explicitly; never substitute for a failed database query.
export const exampleEvent = { ...manageEvent({
 id:"00000000-0000-4000-8000-000000000001",slug:"contoh-webinar-awan-event",
 title:"Contoh Webinar Awan Event",programType:"Webinar",category:"Pengembangan Kompetensi",
 type:"ONLINE",startAt:"2026-12-15T09:00:00+07:00",duration:"09.00–10.00 WIB",
 city:"Online",venue:"Online",price:0,quotaLeft:100,credits:0,speaker:"",registrationStatus:"COMING_SOON",
 summary:"Contoh event untuk meninjau tampilan. Pendaftaran belum dibuka.",
 description:"Contoh event untuk meninjau halaman dan pengaturan sebelum menerbitkan program pertama.",
 audience:"Peserta Awan Event",speakers:[],learningOutcomes:[],sessions:[],tickets:[
 {id:"gratis",name:"Akses webinar",attendance:"ONLINE",price:0,pricingMode:"free",quota:100,quotaLeft:100,benefits:[],status:"active"}
 ]
}), publication:"published" as const };
