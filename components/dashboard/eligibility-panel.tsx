"use client";
import { CheckCircle2, Circle } from "lucide-react";
import { usePlatform } from "@/components/platform/provider";
import { Panel } from "@/components/platform/ui";
import { activityLabels, requiredActivities, eligible, type Registration } from "@/lib/platform-model";
export function EligibilityPanel({registration,slug}:{registration?:Registration;slug?:string}){
 const {state}=usePlatform();
 const selected=registration||state.registrations.find(item=>item.email===state.session.email&&(!slug||item.eventSlug===slug));
 const event=state.events.find(item=>item.slug===selected?.eventSlug);
 if(!selected||!event)return <Panel title="Persyaratan sertifikat"><p className="text-sm text-content-muted">Persyaratan tersedia setelah Anda mendaftar pada event yang menyediakan sertifikat.</p></Panel>;
 if(!event.certificateEnabled)return <Panel title="Sertifikat"><p className="text-sm text-content-muted">Event ini tidak menyediakan sertifikat.</p></Panel>;
 const status=selected.certificate ? selected.certificate.status==="revoked" ? "Sertifikat dicabut. Hubungi tim melalui halaman kontak untuk bantuan." : "Sertifikat sudah terbit." : eligible(selected,event) ? "Persyaratan terpenuhi. Sertifikat belum terbit." : "Selesaikan persyaratan event berikut untuk memperoleh sertifikat.";
 return <Panel title="Persyaratan sertifikat"><p className="mb-6 text-sm text-content-muted">{status}</p>{selected.payment!=="paid"&&<p className="mb-4 text-sm">Selesaikan pembayaran terlebih dahulu.</p>}<div className="grid gap-3 sm:grid-cols-2">{requiredActivities(event).map(key=>{const done=selected.progress[key];const Icon=done?CheckCircle2:Circle;return <div key={key} className={"flex items-center gap-3 rounded-2xl border p-4 "+(done?"border-primary-400/30 bg-primary-100":"border-content-title/10")}><Icon size={22} aria-hidden="true" className={done?"text-primary-600":"text-content-muted"}/><div><strong className="text-sm">{activityLabels[key]}</strong><p className="mt-1 text-xs text-content-muted">{done?"Terpenuhi":"Belum selesai"}</p></div></div>})}</div></Panel>;
}
