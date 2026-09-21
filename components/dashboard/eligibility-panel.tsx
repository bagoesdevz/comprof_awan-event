"use client";
import { CheckCircle2, Circle } from "lucide-react";
import { usePlatform } from "@/components/platform/provider";
import { Panel } from "@/components/platform/ui";
import { activityLabels, type Registration } from "@/lib/platform-model";
export function EligibilityPanel({registration,slug}:{registration?:Registration;slug?:string}){
 const {state}=usePlatform();const r=registration||state.registrations.find(r=>r.email===state.session.email&&(!slug||r.eventSlug===slug));
 return <Panel title="Empat langkah menuju sertifikat"><p className="mb-6 text-sm text-content-muted">Keempat persyaratan harus terpenuhi untuk penerbitan otomatis.</p><div className="grid gap-3 sm:grid-cols-2">{Object.entries(activityLabels).map(([key,label])=>{const done=r?.progress[key as keyof Registration["progress"]];const Icon=done?CheckCircle2:Circle;return <div key={key} className={"flex items-center gap-3 rounded-2xl border p-4 "+(done?"border-primary-400/30 bg-primary-100":"border-content-title/10")}><Icon size={22} className={done?"text-primary-600":"text-content-muted"}/><div><strong className="text-sm">{label}</strong><p className="mt-1 text-xs text-content-muted">{done?"Terpenuhi":"Belum selesai"}</p></div></div>})}</div></Panel>;
}

