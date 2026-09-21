"use client";

import { FormEvent, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Eye,
  FileCheck2,
  ImageIcon,
  Laptop2,
  MapPinned,
  Plus,
  Save,
  Send,
  Trash2,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import { EventPresentation } from "@/components/platform/event-presentation";
import { readImage } from "@/components/platform/assets";
import { usePlatform } from "@/components/platform/provider";
import { Field, Panel } from "@/components/platform/ui";
import {
  manageEvent,
  type Assessment,
  type Block,
  type CertificatePlacement,
  type ManagedEvent,
  type Question,
} from "@/lib/platform-model";

type EventKind = "Webinar" | "Seminar" | "Pelatihan";
type Ticket = ManagedEvent["tickets"][number];
type Speaker = ManagedEvent["speakers"][number];
type Session = ManagedEvent["sessions"][number];

const steps = [
  "Informasi program",
  "Jadwal & akses",
  "Materi & pembicara",
  "Landing page",
  "Tiket & pendaftaran",
  "Evaluasi",
  "Sertifikat",
  "Review & publish",
];

const eventChoices: { value: EventKind; description: string; Icon: LucideIcon }[] = [
  { value: "Webinar", description: "Online", Icon: Video },
  { value: "Seminar", description: "Tatap muka atau hybrid", Icon: Users },
  { value: "Pelatihan", description: "Praktik dan pengembangan kompetensi", Icon: BookOpenCheck },
];

const landingTemplates: Record<EventKind, string[]> = {
  Webinar: ["Hero", "Speaker", "Benefits", "Agenda", "Access", "Ticket", "Countdown", "FAQ", "CTA"],
  Seminar: ["Hero", "About", "Speaker", "Agenda", "Access", "Ticket", "Partner", "FAQ", "CTA"],
  Pelatihan: ["Hero", "Benefits", "About", "Speaker", "Agenda", "Access", "Certificate", "Ticket", "FAQ", "CTA"],
};

const sectionSource: Record<string, { label: string; step?: number }> = {
  Hero: { label: "Informasi program", step: 0 },
  Speaker: { label: "Materi & pembicara", step: 2 },
  About: { label: "Informasi program", step: 0 },
  Benefits: { label: "Materi & pembicara", step: 2 },
  Agenda: { label: "Materi & pembicara", step: 2 },
  Access: { label: "Jadwal & akses", step: 1 },
  Ticket: { label: "Tiket & pendaftaran", step: 4 },
  Countdown: { label: "Jadwal & akses", step: 1 },
  Certificate: { label: "Sertifikat", step: 6 },
  Partner: { label: "Konten section" },
  FAQ: { label: "Konten section" },
  CTA: { label: "Konten section" },
};

const methodOptions = ["Presentasi materi", "Diskusi interaktif", "Studi kasus", "Demonstrasi", "Praktik dan simulasi", "Pre-test dan post-test"];
const materialOptions = ["Basic Trauma and Cardiac Life Support (BTCLS)", "Basic Life Support (BLS)", "Resusitasi Neonatus", "Pelatihan PONED", "Manajemen Ambulans Prehospital", "Patient Safety dan Keselamatan Pasien", "Komunikasi Efektif SBAR", "Audit Klinis dan Mutu Pelayanan"];
const lines = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);
const emptySpeaker = (): Speaker => ({ name: "", role: "Narasumber", organization: "", bio: "" });
const emptySession = (): Session => ({ time: "09.00", title: "", note: "" });
const emptyQuestion = (prefix: string): Question => ({ id: `${prefix}-${Date.now()}`, text: "", options: ["", "", ""], correct: 0, score: 100 });
const defaultPlacement: CertificatePlacement = { name: { x: 50, y: 47, size: 42, color: "#211052" }, number: { x: 50, y: 68, size: 20, color: "#5D607D" } };

function eventKind(value?: string): EventKind | "" {
  const normalized = value?.toLowerCase() || "";
  if (normalized.includes("webinar")) return "Webinar";
  if (normalized.includes("seminar")) return "Seminar";
  if (normalized.includes("pelatihan") || normalized.includes("workshop")) return "Pelatihan";
  return "";
}

function makeBlocks(kind: EventKind): Block[] {
  return landingTemplates[kind].map((type, index) => ({ id: `block-${type.toLowerCase()}-${index}`, type, title: type, body: "", visible: true }));
}

function AssessmentEditor({ value, onChange, kind }: { value: Assessment; onChange: Dispatch<SetStateAction<Assessment>>; kind: "pre" | "post" }) {
  function updateQuestion(index: number, change: Partial<Question>) {
    onChange((current) => ({ ...current, questions: current.questions.map((question, itemIndex) => itemIndex === index ? { ...question, ...change } : question) }));
  }

  return <div className="grid gap-6">
    <label className="flex min-h-12 items-center justify-between gap-4 rounded-2xl bg-surface-muted px-4 text-sm font-semibold">Aktifkan {kind === "pre" ? "pre-test" : "post-test"}<input type="checkbox" checked={value.enabled} onChange={(event) => onChange((current) => ({ ...current, enabled: event.target.checked }))} /></label>
    {value.enabled && <>
      <div className="grid gap-4 sm:grid-cols-3">
        {kind === "post" && <Field label="Nilai lulus"><input type="number" min="0" max="100" value={value.passingScore} onChange={(event) => onChange((current) => ({ ...current, passingScore: Number(event.target.value) }))} /></Field>}
        <Field label="Maksimal percobaan"><input type="number" min="1" value={value.attempts} onChange={(event) => onChange((current) => ({ ...current, attempts: Number(event.target.value) }))} /></Field>
        <Field label="Batas waktu (menit)"><input type="number" min="1" value={value.timeLimit} onChange={(event) => onChange((current) => ({ ...current, timeLimit: Number(event.target.value) }))} /></Field>
      </div>
      <div className="grid gap-4">{value.questions.map((question, index) => <section key={question.id} className="rounded-2xl border border-primary-600/10 p-5">
        <div className="flex items-center justify-between gap-4"><h3 className="font-semibold">Pertanyaan {index + 1}</h3><button type="button" aria-label={`Hapus pertanyaan ${index + 1}`} className="grid h-10 w-10 place-items-center rounded-full text-[#B42318] hover:bg-[#FEF2F2]" onClick={() => onChange((current) => ({ ...current, questions: current.questions.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 size={16} /></button></div>
        <div className="mt-4 grid gap-4"><Field label="Pertanyaan"><input value={question.text} onChange={(event) => updateQuestion(index, { text: event.target.value })} /></Field><div className="grid gap-3 sm:grid-cols-3">{question.options.map((option, optionIndex) => <Field key={optionIndex} label={`Pilihan ${optionIndex + 1}`}><input value={option} onChange={(event) => updateQuestion(index, { options: question.options.map((item, itemIndex) => itemIndex === optionIndex ? event.target.value : item) })} /></Field>)}</div><div className="grid gap-4 sm:grid-cols-2"><Field label="Jawaban benar"><select value={question.correct} onChange={(event) => updateQuestion(index, { correct: Number(event.target.value) })}>{question.options.map((_, optionIndex) => <option value={optionIndex} key={optionIndex}>Pilihan {optionIndex + 1}</option>)}</select></Field><Field label="Bobot"><input type="number" min="0" value={question.score} onChange={(event) => updateQuestion(index, { score: Number(event.target.value) })} /></Field></div></div>
      </section>)}</div>
      <button type="button" className="flow-button secondary justify-self-start" onClick={() => onChange((current) => ({ ...current, questions: [...current.questions, emptyQuestion(kind)] }))}><Plus size={15} />Tambah pertanyaan</button>
    </>}
  </div>;
}

function SpeakerEditor({ speakers, setSpeakers, onNotice }: { speakers: Speaker[]; setSpeakers: Dispatch<SetStateAction<Speaker[]>>; onNotice: (message: string) => void }) {
  function add(role: "Pemateri" | "Moderator") {
    setSpeakers((current) => [...current, { ...emptySpeaker(), role }]);
  }

  function updateSpeaker(index: number, change: Partial<Speaker>) {
    setSpeakers((current) => current.map((speaker, itemIndex) => itemIndex === index ? { ...speaker, ...change } : speaker));
  }

  return <section className="rounded-2xl bg-surface-muted p-4 sm:p-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><h4 className="font-semibold">Pemateri dan moderator</h4><p className="mt-1 text-xs text-content-muted">{speakers.length} pengisi acara</p></div>
      <div className="flex flex-wrap gap-2"><button type="button" className="flow-button secondary" onClick={() => add("Pemateri")}><Plus size={15} />Tambah pemateri</button><button type="button" className="flow-button secondary" onClick={() => add("Moderator")}><Plus size={15} />Tambah moderator</button></div>
    </div>
    <div className="mt-5 grid gap-4">{speakers.map((speaker, index) => {
      const moderator = /moderator/i.test(speaker.role);
      return <article key={index} className="rounded-2xl bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4"><div><span className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${moderator ? "bg-[#EFF6FF] text-[#3156B8]" : "bg-primary-100 text-primary-800"}`}>{moderator ? "Moderator" : "Pemateri"}</span><strong className="ml-3 text-sm">{speaker.name || `${moderator ? "Moderator" : "Pemateri"} ${index + 1}`}</strong></div><button type="button" aria-label={`Hapus ${moderator ? "moderator" : "pemateri"} ${index + 1}`} className="grid h-10 w-10 place-items-center rounded-full text-[#B42318] hover:bg-[#FEF2F2]" onClick={() => setSpeakers((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={16} /></button></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Nama"><input value={speaker.name} onChange={(event) => updateSpeaker(index, { name: event.target.value })} /></Field><Field label="Peran"><input list="speaker-role-options" value={speaker.role} onChange={(event) => updateSpeaker(index, { role: event.target.value })} /></Field><Field label="Institusi"><input value={speaker.organization} onChange={(event) => updateSpeaker(index, { organization: event.target.value })} /></Field><Field label="Foto"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { updateSpeaker(index, { photo: await readImage(file) }); } catch (error) { onNotice((error as Error).message); } }} /></Field><Field label="Profil singkat" className="sm:col-span-2"><textarea rows={3} value={speaker.bio} onChange={(event) => updateSpeaker(index, { bio: event.target.value })} /></Field></div>
      </article>;
    })}</div><datalist id="speaker-role-options"><option value="Pemateri" /><option value="Keynote Speaker" /><option value="Trainer" /><option value="Moderator" /></datalist>
  </section>;
}

export function EventWizard({initialSlug}:{initialSlug?:string}){
 const {state,ready}=usePlatform();
 if(!ready)return <p role="status">Memuat editor…</p>;
 if(initialSlug&&!state.events.some(e=>e.slug===initialSlug))return <p role="alert">Event tidak ditemukan.</p>;
 return <EventWizardEditor initialSlug={initialSlug}/>;
}
function EventWizardEditor({ initialSlug }: { initialSlug?: string }) {
  const { state, update } = usePlatform();
  const base = state.events.find((event) => event.slug === initialSlug);
  const initialKind = eventKind(base?.programType);
  const [kind, setKind] = useState<EventKind | "">(initialKind);
  const [started, setStarted] = useState(Boolean(base));
  const [webinarPricing, setWebinarPricing] = useState<"free" | "paid">((base?.tickets[0]?.price || 0) === 0 ? "free" : "paid");
  const [step, setStep] = useState(0);
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(false);
  const [landingSection, setLandingSection] = useState<string | null>(null);
  const [assessmentTab, setAssessmentTab] = useState<"pre" | "post">("pre");
  const [form, setForm] = useState(() => ({
    title: base?.title || "", programType: initialKind || "", type: base?.type || "ONLINE", category: base?.category || "", summary: base?.summary || "", description: base?.description || "", audience: base?.audience || "", objectives: base?.objectives || "",
    startAt: base?.startAt?.slice(0, 16) || "", endAt: base?.endAt?.slice(0, 16) || "", city: base?.city || "Online", venue: base?.venue || "Zoom", venueAddress: base?.venueAddress || "", capacity: String(base?.capacity || 100), waitlist: base?.waitlist ?? true,
    partner: base?.partner || "", coordinator: base?.coordinator || "", requirements: base?.requirements || "", learningOutcomes: base?.learningOutcomes.join("\n") || "", publication: base?.publication || "draft",
    meetingProvider: base?.meetingProvider || "Zoom", meetingUrl: base?.meetingUrl || "", meetingId: base?.meetingId || "", meetingPasscode: base?.meetingPasscode || "", accessOpensAt: base?.accessOpensAt?.slice(0, 16) || "",
    reminder: base?.reminder || "H-1 dan 2 jam sebelum event", certificatePattern: base?.certificatePattern || "AWN-{year}-{sequence}", certificateTemplate: base?.certificateTemplate || "", certificateEnabled: base?.certificateEnabled ?? true, banner: base?.banner || "",
  }));
  const [learningMethods, setLearningMethods] = useState<string[]>(base?.learningMethods || ["Presentasi materi", "Diskusi interaktif"]);
  const [speakers, setSpeakers] = useState<Speaker[]>(base?.speakers.length ? base.speakers : [emptySpeaker()]);
  const [sessions, setSessions] = useState<Session[]>(base?.sessions.length ? base.sessions : [emptySession()]);
  const [tickets, setTickets] = useState<Ticket[]>(base?.tickets.map((ticket) => ({ ...ticket, pricingMode: ticket.price === 0 ? "free" : ticket.pricingMode || "paid", status: ticket.status || "active", startsAt: ticket.startsAt || "", endsAt: ticket.endsAt || "", quantityLimit: ticket.quantityLimit || 1 })) || []);
  const [blocks, setBlocks] = useState<Block[]>(base?.blocks || []);
  const [preTest, setPreTest] = useState<Assessment>(() => ({ enabled: base?.preTest.enabled ?? true, questions: base?.preTest.questions || [emptyQuestion("pre")], passingScore: base?.preTest.passingScore || 0, attempts: base?.preTest.attempts || 3, timeLimit: base?.preTest.timeLimit || 15 }));
  const [postTest, setPostTest] = useState<Assessment>(() => ({ enabled: base?.postTest.enabled ?? true, questions: base?.postTest.questions || [emptyQuestion("post")], passingScore: base?.postTest.passingScore || 70, attempts: base?.postTest.attempts || 3, timeLimit: base?.postTest.timeLimit || 15 }));
  const [certificatePlacement, setCertificatePlacement] = useState<CertificatePlacement>(base?.certificatePlacement || defaultPlacement);
  const valid = useMemo(() => Boolean(form.title.trim() && form.category.trim() && form.startAt && form.description.trim() && form.audience.trim() && form.objectives.trim()), [form]);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) { setForm((current) => ({ ...current, [key]: value })); }

  function begin() {
    if (!kind) return;
    const mode = kind === "Webinar" ? webinarPricing : "paid";
    const attendance = kind === "Webinar" ? "ONLINE" : "ONSITE";
    setForm((current) => ({ ...current, programType: kind, type: attendance, city: kind === "Webinar" ? "Online" : current.city === "Online" ? "" : current.city, venue: kind === "Webinar" ? "Zoom" : current.venue === "Zoom" ? "" : current.venue }));
    setTickets([{ id: `ticket-${Date.now()}`, name: mode === "free" ? "Tiket Gratis" : "Regular", attendance, pricingMode: mode, price: mode === "free" ? 0 : 100000, quota: 100, quotaLeft: 100, benefits: ["Akses event", "Materi digital", "E-sertifikat"], status: "active", startsAt: "", endsAt: "", quantityLimit: 1 }]);
    setBlocks(makeBlocks(kind));
    setStarted(true);
    setStep(0);
  }

  function buildEvent(publish = false): ManagedEvent {
    const template = (base || state.events[0]) as ManagedEvent;
    const slug = (base?.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")) || "event-baru";
    const startAt = form.startAt ? new Date(form.startAt).toISOString() : new Date().toISOString();
    const endAt = form.endAt ? new Date(form.endAt).toISOString() : startAt;
    const event = manageEvent({ ...template, id: base?.id || `evt-${Date.now()}`, slug, title: form.title || `Draft ${kind || "event"}`, category: form.category || "Kategori belum diisi", type: form.type as ManagedEvent["type"], startAt, duration: `${form.startAt.slice(11, 16) || "09.00"}–${form.endAt.slice(11, 16) || "selesai"} WIB`, city: form.city, venue: form.venue, venueAddress: form.venueAddress || undefined, mapLabel: form.venue || form.city, price: tickets[0]?.price || 0, quotaLeft: tickets.reduce((total, ticket) => total + ticket.quota, 0), speaker: speakers.find((speaker) => speaker.name.trim())?.name || "Narasumber segera diumumkan", registrationStatus: "OPEN", summary: form.summary || form.description || "Ringkasan event belum diisi.", description: form.description || "Deskripsi event belum diisi.", audience: form.audience || "Sasaran peserta belum diisi.", speakers: speakers.filter((speaker) => speaker.name.trim()), learningOutcomes: lines(form.learningOutcomes), sessions: sessions.filter((session) => session.title.trim()), tickets: tickets.map((ticket) => ({ ...ticket, price: ticket.pricingMode === "free" ? 0 : ticket.price, quotaLeft: ticket.quota })) });
    return Object.assign(event, { detailRevision: 2, programType: form.programType, publication: publish ? "published" : form.publication, lifecycle: "upcoming", endAt, capacity: Number(form.capacity) || 100, waitlist: form.waitlist, meetingProvider: form.meetingProvider as "Zoom" | "Google Meet", meetingUrl: form.meetingUrl, meetingId: form.meetingId, meetingPasscode: form.meetingPasscode, accessOpensAt: form.accessOpensAt ? new Date(form.accessOpensAt).toISOString() : "", objectives: form.objectives, learningMethods, partner: form.partner, coordinator: form.coordinator, requirements: form.requirements, blocks, preTest, postTest, certificateEnabled: form.certificateEnabled, certificatePattern: form.certificatePattern, certificateTemplate: form.certificateTemplate, certificatePlacement, reminder: form.reminder, banner: form.banner });
  }

  async function save(publish = false) {
    if (!valid) { setNotice("Lengkapi nama, bidang materi, jadwal, sasaran, tujuan, dan deskripsi program."); return; }
    if (publish && form.certificateEnabled && !form.certificateTemplate) { setNotice("Upload template sertifikat atau nonaktifkan sertifikat sebelum publish."); setStep(6); return; }
    const event = buildEvent(publish);
    const saved = await update((draft) => { const index = draft.events.findIndex((item) => item.slug === event.slug); if (index >= 0) draft.events[index] = event; else draft.events.unshift(event); });
    if (!saved) return;
    setNotice(publish ? "Event dipublikasikan." : "Draft tersimpan.");
  }

  function submit(event: FormEvent) { event.preventDefault(); if (step < steps.length - 1) setStep((current) => current + 1); else save(form.publication === "published"); }
  function addTicket() { setTickets((current) => [...current, { id: `ticket-${Date.now()}`, name: "Tiket baru", attendance: form.type === "ONSITE" ? "ONSITE" : "ONLINE", pricingMode: "paid", price: 100000, quota: 50, quotaLeft: 50, benefits: ["Akses event"], status: "active", startsAt: "", endsAt: "", quantityLimit: 1 }]); }
  function moveBlock(index: number, direction: -1 | 1) { setBlocks((current) => { const target = index + direction; if (target < 0 || target >= current.length) return current; const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next; }); }

  if (!started) return <div className="mx-auto max-w-5xl py-4 sm:py-8">
    <button type="button" onClick={() => history.back()} className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-content-body hover:text-primary-700"><ArrowLeft size={16} />Kembali</button>
    <header className="max-w-2xl"><h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Event apa yang akan dibuat?</h1><p className="mt-3 text-sm leading-6 text-content-body">Pilih format program. Form dan landing page akan menyesuaikan.</p></header>
    <div className="mt-8 grid gap-4 md:grid-cols-3">{eventChoices.map(({ value, description, Icon }) => <button key={value} type="button" aria-pressed={kind === value} onClick={() => setKind(value)} className={`min-h-44 rounded-2xl border p-6 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${kind === value ? "border-primary-600 bg-primary-100" : "border-primary-600/10 bg-white hover:border-primary-400 hover:bg-surface-muted"}`}><Icon className={kind === value ? "text-primary-700" : "text-content-muted"} size={28} strokeWidth={1.7} /><strong className="mt-8 block text-xl">{value}</strong><span className="mt-2 block text-sm leading-6 text-content-body">{description}</span></button>)}</div>
    {kind === "Webinar" && <fieldset className="mt-6 rounded-2xl bg-white p-6"><legend className="text-sm font-semibold">Model pendaftaran webinar</legend><div className="mt-4 grid gap-3 sm:grid-cols-2">{([['free', 'Gratis', 'Tanpa pembayaran.'], ['paid', 'Berbayar', 'Pembayaran sebelum terkonfirmasi.']] as const).map(([value, label, description]) => <button key={value} type="button" aria-pressed={webinarPricing === value} onClick={() => setWebinarPricing(value)} className={`rounded-2xl border px-5 py-4 text-left ${webinarPricing === value ? "border-primary-600 bg-primary-100" : "border-primary-600/10 hover:bg-surface-muted"}`}><strong className="block">{label}</strong><span className="mt-1 block text-xs text-content-muted">{description}</span></button>)}</div></fieldset>}
    <div className="mt-8 flex justify-end"><button type="button" disabled={!kind} onClick={begin} className="flow-button">Lanjutkan<ArrowRight size={16} /></button></div>
  </div>;

  const selectedBlock = blocks.find((block) => block.id === landingSection) || null;
  return <div className="mx-auto max-w-[1280px]">
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><button type="button" onClick={() => { setStarted(false); setLandingSection(null); }} className="mb-4 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-primary-700"><ArrowLeft size={15} />Ganti jenis event</button><h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Buat {kind.toLowerCase()}</h1><p className="mt-2 text-sm text-content-body">{form.title || "Draft baru"}</p></div><button type="button" className="flow-button secondary self-start sm:self-auto" onClick={() => setPreview(true)}><Eye size={16} />Pratinjau</button></header>
    {notice && <p role="status" className={`flow-alert mb-6 ${notice.includes("Lengkapi") || notice.includes("Upload") ? "warning" : "success"}`}>{notice}</p>}
    <form onSubmit={submit} className="grid min-w-0 gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="w-full min-w-0 max-w-full self-start rounded-2xl bg-white p-4 xl:sticky xl:top-24"><ol className="flex w-full min-w-0 max-w-full gap-2 overflow-x-auto pb-1 xl:grid xl:overflow-visible">{steps.map((label, index) => <li key={label} className="shrink-0 xl:shrink"><button type="button" onClick={() => { setStep(index); setLandingSection(null); }} aria-current={step === index ? "step" : undefined} className={`flex min-h-11 min-w-44 items-center gap-3 rounded-xl px-3 text-left text-xs xl:w-full xl:min-w-0 ${step === index ? "bg-primary-100 font-semibold text-primary-900" : "text-content-muted hover:bg-surface-muted hover:text-content-title"}`}><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] ${index < step ? "bg-[#087A55] text-white" : step === index ? "bg-primary-600 text-white" : "bg-surface-muted"}`}>{index < step ? <Check size={13} /> : index + 1}</span>{label}</button></li>)}</ol></aside>
      <Panel className="min-w-0">
        <div className="mb-8 flex items-center justify-between gap-4"><div><p className="text-xs font-semibold text-primary-700">Langkah {step + 1} dari {steps.length}</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">{steps[step]}</h2></div><span className="rounded-full bg-primary-100 px-3 py-2 text-xs font-semibold text-primary-800">{kind}</span></div>

        {step === 0 && <div className="grid gap-5 sm:grid-cols-2"><Field label="Nama event *" className="sm:col-span-2"><input required value={form.title} onChange={(event) => setField("title", event.target.value)} placeholder={`Nama ${kind.toLowerCase()}`} /></Field><Field label="Jenis program"><input value={form.programType} readOnly /></Field><Field label="Format kehadiran *"><select value={form.type} onChange={(event) => setField("type", event.target.value as ManagedEvent["type"])}><option value="ONLINE">Online</option><option value="ONSITE">Tatap muka</option><option value="HYBRID">Hybrid</option></select></Field><Field label="Bidang materi *"><input required list="awan-event-materials" value={form.category} onChange={(event) => setField("category", event.target.value)} placeholder="Pilih atau tulis bidang materi" /><datalist id="awan-event-materials">{materialOptions.map((material) => <option value={material} key={material} />)}</datalist></Field><Field label="Sasaran peserta *"><textarea required rows={3} value={form.audience} onChange={(event) => setField("audience", event.target.value)} /></Field><Field label="Ringkasan publik" className="sm:col-span-2"><textarea rows={3} value={form.summary} onChange={(event) => setField("summary", event.target.value)} /></Field><Field label="Deskripsi program *" className="sm:col-span-2"><textarea required rows={5} value={form.description} onChange={(event) => setField("description", event.target.value)} /></Field><Field label="Tujuan program *" className="sm:col-span-2"><textarea required rows={4} value={form.objectives} onChange={(event) => setField("objectives", event.target.value)} /></Field></div>}

        {step === 1 && <div className="grid gap-5 sm:grid-cols-2"><Field label="Mulai *"><input required type="datetime-local" value={form.startAt} onChange={(event) => setField("startAt", event.target.value)} /></Field><Field label="Selesai"><input type="datetime-local" value={form.endAt} onChange={(event) => setField("endAt", event.target.value)} /></Field><Field label="Kapasitas peserta"><input type="number" min="1" value={form.capacity} onChange={(event) => setField("capacity", event.target.value)} /></Field><Field label="Waitlist"><select value={String(form.waitlist)} onChange={(event) => setField("waitlist", event.target.value === "true")}><option value="true">Aktif</option><option value="false">Nonaktif</option></select></Field>
          {form.type !== "ONSITE" && <section className="sm:col-span-2 rounded-2xl bg-surface-muted p-5"><div className="mb-5 flex items-center gap-3"><Laptop2 size={20} className="text-primary-700" /><h3 className="font-semibold">Akses online</h3></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Platform"><select value={form.meetingProvider} onChange={(event) => setField("meetingProvider", event.target.value as "Zoom" | "Google Meet")}><option>Zoom</option><option>Google Meet</option></select></Field><Field label="Link meeting"><input type="url" value={form.meetingUrl} onChange={(event) => setField("meetingUrl", event.target.value)} placeholder="https://..." /></Field><Field label="Meeting ID"><input value={form.meetingId} onChange={(event) => setField("meetingId", event.target.value)} /></Field><Field label="Passcode"><input value={form.meetingPasscode} onChange={(event) => setField("meetingPasscode", event.target.value)} /></Field><Field label="Akses dibuka" className="sm:col-span-2"><input type="datetime-local" value={form.accessOpensAt} onChange={(event) => setField("accessOpensAt", event.target.value)} /></Field></div></section>}
          {form.type !== "ONLINE" && <section className="sm:col-span-2 rounded-2xl bg-surface-muted p-5"><div className="mb-5 flex items-center gap-3"><MapPinned size={20} className="text-primary-700" /><h3 className="font-semibold">Lokasi kegiatan</h3></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Kota"><input value={form.city} onChange={(event) => setField("city", event.target.value)} /></Field><Field label="Venue"><input value={form.venue} onChange={(event) => setField("venue", event.target.value)} /></Field><Field label="Alamat lengkap" className="sm:col-span-2"><textarea rows={3} value={form.venueAddress} onChange={(event) => setField("venueAddress", event.target.value)} /></Field></div></section>}
          <Field label="Mitra / institusi"><input value={form.partner} onChange={(event) => setField("partner", event.target.value)} /></Field><Field label="Koordinator"><input value={form.coordinator} onChange={(event) => setField("coordinator", event.target.value)} /></Field><Field label="Kebutuhan teknis" className="sm:col-span-2"><textarea rows={3} value={form.requirements} onChange={(event) => setField("requirements", event.target.value)} /></Field></div>}

        {step === 2 && <div className="grid gap-8"><Field label="Capaian pembelajaran"><textarea rows={5} value={form.learningOutcomes} onChange={(event) => setField("learningOutcomes", event.target.value)} placeholder="Satu capaian per baris" /></Field><fieldset><legend className="text-sm font-semibold">Metode pembelajaran</legend><div className="mt-4 grid gap-3 sm:grid-cols-2">{methodOptions.map((method) => <label key={method} className="flex min-h-12 items-center gap-3 rounded-xl border border-primary-600/10 px-4 text-sm"><input type="checkbox" checked={learningMethods.includes(method)} onChange={() => setLearningMethods((current) => current.includes(method) ? current.filter((item) => item !== method) : [...current, method])} />{method}</label>)}</div></fieldset>
          <SpeakerEditor speakers={speakers} setSpeakers={setSpeakers} onNotice={setNotice} />
          <section><div className="flex items-center justify-between gap-4"><h3 className="text-lg font-semibold">Agenda kegiatan</h3><button type="button" className="flow-button secondary" onClick={() => setSessions((current) => [...current, emptySession()])}><Plus size={15} />Tambah</button></div><div className="mt-4 grid gap-3">{sessions.map((session, index) => <div key={index} className="grid gap-4 rounded-2xl bg-surface-muted p-4 sm:grid-cols-[110px_1fr_1fr_auto]"><Field label="Waktu"><input value={session.time} onChange={(event) => setSessions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, time: event.target.value } : item))} /></Field><Field label="Sesi"><input value={session.title} onChange={(event) => setSessions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} /></Field><Field label="Catatan"><input value={session.note} onChange={(event) => setSessions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, note: event.target.value } : item))} /></Field><button type="button" aria-label={`Hapus agenda ${index + 1}`} className="mt-6 grid h-10 w-10 place-items-center rounded-full text-[#B42318] hover:bg-white" onClick={() => setSessions((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={16} /></button></div>)}</div></section>
        </div>}

        {step === 3 && (selectedBlock ? <div><button type="button" onClick={() => setLandingSection(null)} className="mb-6 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary-700"><ArrowLeft size={15} />Semua section</button><div className="flex flex-col gap-3 border-b border-primary-600/10 pb-6 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-2xl font-semibold">{selectedBlock.type}</h3></div><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={selectedBlock.visible} onChange={(event) => setBlocks((current) => current.map((block) => block.id === selectedBlock.id ? { ...block, visible: event.target.checked } : block))} />Tampilkan</label></div><div className="mt-6 grid gap-5"><Field label="Judul section"><input value={selectedBlock.title === selectedBlock.type ? "" : selectedBlock.title} placeholder={`Judul default ${selectedBlock.type}`} onChange={(event) => setBlocks((current) => current.map((block) => block.id === selectedBlock.id ? { ...block, title: event.target.value || block.type } : block))} /></Field><Field label="Teks tambahan"><textarea rows={5} value={selectedBlock.body} onChange={(event) => setBlocks((current) => current.map((block) => block.id === selectedBlock.id ? { ...block, body: event.target.value } : block))} /></Field><Field label="Gambar section"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { const image = await readImage(file); setBlocks((current) => current.map((block) => block.id === selectedBlock.id ? { ...block, image } : block)); } catch (error) { setNotice((error as Error).message); } }} /></Field>{selectedBlock.type === "Speaker" && <SpeakerEditor speakers={speakers} setSpeakers={setSpeakers} onNotice={setNotice} />}{sectionSource[selectedBlock.type]?.step !== undefined && <button type="button" className="flow-button secondary justify-self-start" onClick={() => { setStep(sectionSource[selectedBlock.type].step!); setLandingSection(null); }}>Edit {sectionSource[selectedBlock.type].label}<ChevronRight size={15} /></button>}</div></div> : <div><div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-lg font-semibold">Struktur landing page {kind.toLowerCase()}</h3><p className="mt-1 text-sm text-content-muted">Pilih section untuk mengedit konten.</p></div><Field label="Poster utama"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { setField("banner", await readImage(file)); } catch (error) { setNotice((error as Error).message); } }} /></Field></div><div className="grid gap-3">{blocks.map((block, index) => <div key={block.id} className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] ${block.visible ? "border-primary-600/10 bg-white" : "border-transparent bg-surface-muted opacity-65"}`}><button type="button" onClick={() => setLandingSection(block.id)} className="flex min-h-12 min-w-0 items-center gap-4 rounded-xl px-2 text-left hover:bg-surface-muted"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-700"><ImageIcon size={17} /></span><span className="min-w-0"><strong className="block truncate text-sm">{block.type}</strong><small className="block truncate text-content-muted">{sectionSource[block.type]?.label || "Konten section"}</small></span><ChevronRight className="ml-auto shrink-0 text-content-muted" size={16} /></button><span className={`hidden rounded-full px-3 py-2 text-[10px] font-semibold sm:inline ${block.visible ? "bg-[#ECFDF5] text-[#087A55]" : "bg-surface-muted text-content-muted"}`}>{block.visible ? "Tampil" : "Tersembunyi"}</span><div className="flex"><button type="button" disabled={index === 0} aria-label={`Naikkan ${block.type}`} className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface-muted disabled:opacity-30" onClick={() => moveBlock(index, -1)}><ChevronUp size={16} /></button><button type="button" disabled={index === blocks.length - 1} aria-label={`Turunkan ${block.type}`} className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface-muted disabled:opacity-30" onClick={() => moveBlock(index, 1)}><ChevronDown size={16} /></button></div></div>)}</div></div>)}

        {step === 4 && <div className="grid gap-5">{tickets.map((ticket, index) => <section key={ticket.id} className="rounded-2xl border border-primary-600/10 p-5"><div className="flex items-center justify-between gap-4"><div><span className="text-xs text-content-muted">Paket {index + 1}</span><h3 className="mt-1 font-semibold">{ticket.name}</h3></div><button type="button" aria-label={`Hapus tiket ${ticket.name}`} className="grid h-10 w-10 place-items-center rounded-full text-[#B42318] hover:bg-[#FEF2F2]" onClick={() => setTickets((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={16} /></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Field label="Nama tiket"><input value={ticket.name} onChange={(event) => setTickets((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} /></Field><Field label="Jenis harga"><select value={ticket.pricingMode || (ticket.price === 0 ? "free" : "paid")} onChange={(event) => setTickets((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, pricingMode: event.target.value as "free" | "paid", price: event.target.value === "free" ? 0 : item.price || 100000 } : item))}><option value="free">Gratis</option><option value="paid">Berbayar</option></select></Field>{(ticket.pricingMode || (ticket.price === 0 ? "free" : "paid")) === "paid" && <Field label="Harga"><input type="number" min="0" value={ticket.price} onChange={(event) => setTickets((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, price: Number(event.target.value) } : item))} /></Field>}<Field label="Cara hadir"><select value={ticket.attendance} onChange={(event) => setTickets((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, attendance: event.target.value as "ONLINE" | "ONSITE" } : item))}><option value="ONLINE">Online</option><option value="ONSITE">Onsite</option></select></Field><Field label="Kuota"><input type="number" min="1" value={ticket.quota} onChange={(event) => setTickets((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, quota: Number(event.target.value), quotaLeft: Number(event.target.value) } : item))} /></Field><Field label="Batas per peserta"><input type="number" min="1" value={ticket.quantityLimit || 1} onChange={(event) => setTickets((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, quantityLimit: Number(event.target.value) } : item))} /></Field><Field label="Pendaftaran mulai"><input type="datetime-local" value={ticket.startsAt?.slice(0, 16) || ""} onChange={(event) => setTickets((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, startsAt: event.target.value } : item))} /></Field><Field label="Pendaftaran berakhir"><input type="datetime-local" value={ticket.endsAt?.slice(0, 16) || ""} onChange={(event) => setTickets((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, endsAt: event.target.value } : item))} /></Field><Field label="Benefit" className="sm:col-span-2 lg:col-span-4"><textarea rows={3} value={ticket.benefits.join("\n")} onChange={(event) => setTickets((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, benefits: lines(event.target.value) } : item))} /></Field></div></section>)}<button type="button" className="flow-button secondary justify-self-start" onClick={addTicket}><Plus size={15} />Tambah paket tiket</button></div>}

        {step === 5 && <div><div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-surface-muted p-1.5"><button type="button" aria-pressed={assessmentTab === "pre"} onClick={() => setAssessmentTab("pre")} className={`min-h-11 rounded-xl text-sm font-semibold ${assessmentTab === "pre" ? "bg-white text-primary-800 shadow-sm" : "text-content-muted"}`}>Pre-test</button><button type="button" aria-pressed={assessmentTab === "post"} onClick={() => setAssessmentTab("post")} className={`min-h-11 rounded-xl text-sm font-semibold ${assessmentTab === "post" ? "bg-white text-primary-800 shadow-sm" : "text-content-muted"}`}>Post-test</button></div>{assessmentTab === "pre" ? <AssessmentEditor value={preTest} onChange={setPreTest} kind="pre" /> : <AssessmentEditor value={postTest} onChange={setPostTest} kind="post" />}</div>}

        {step === 6 && <div className="grid gap-6"><label className="flex min-h-12 items-center justify-between gap-4 rounded-2xl bg-surface-muted px-4 text-sm font-semibold">Aktifkan sertifikat<input type="checkbox" checked={form.certificateEnabled} onChange={(event) => setField("certificateEnabled", event.target.checked)} /></label>{form.certificateEnabled && <><div className="grid gap-5 sm:grid-cols-2"><Field label="Template sertifikat" className="sm:col-span-2"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { setField("certificateTemplate", await readImage(file)); setNotice("Template sertifikat siap."); } catch (error) { setNotice((error as Error).message); } }} /></Field><Field label="Pola nomor"><input value={form.certificatePattern} onChange={(event) => setField("certificatePattern", event.target.value)} /></Field><Field label="Jadwal pengingat"><input value={form.reminder} onChange={(event) => setField("reminder", event.target.value)} /></Field></div><div className="overflow-hidden rounded-2xl bg-surface-muted p-4 sm:p-6"><div className="relative mx-auto aspect-[1.414/1] w-full max-w-3xl overflow-hidden rounded-xl bg-white bg-cover bg-center shadow-sm" style={form.certificateTemplate ? { backgroundImage: `url(${form.certificateTemplate})` } : undefined}>{!form.certificateTemplate && <div className="absolute left-4 top-4 rounded-full bg-surface-muted px-3 py-2 text-xs text-content-muted">Template belum diunggah</div>}<strong className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap" style={{ left: `${certificatePlacement.name.x}%`, top: `${certificatePlacement.name.y}%`, fontSize: `${Math.max(12, certificatePlacement.name.size / 2)}px`, color: certificatePlacement.name.color }}>Nama Peserta</strong><span className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono" style={{ left: `${certificatePlacement.number.x}%`, top: `${certificatePlacement.number.y}%`, fontSize: `${Math.max(9, certificatePlacement.number.size / 2)}px`, color: certificatePlacement.number.color }}>AWN-2026-00001</span></div></div>{([['name', 'Nama peserta'], ['number', 'Nomor sertifikat']] as const).map(([key, label]) => <section key={key} className="rounded-2xl border border-primary-600/10 p-5"><h3 className="font-semibold">{label}</h3><div className="mt-4 grid gap-4 sm:grid-cols-4"><Field label="Posisi horizontal"><input type="range" min="10" max="90" value={certificatePlacement[key].x} onChange={(event) => setCertificatePlacement((current) => ({ ...current, [key]: { ...current[key], x: Number(event.target.value) } }))} /></Field><Field label="Posisi vertikal"><input type="range" min="10" max="90" value={certificatePlacement[key].y} onChange={(event) => setCertificatePlacement((current) => ({ ...current, [key]: { ...current[key], y: Number(event.target.value) } }))} /></Field><Field label="Ukuran"><input type="number" min="12" max="72" value={certificatePlacement[key].size} onChange={(event) => setCertificatePlacement((current) => ({ ...current, [key]: { ...current[key], size: Number(event.target.value) } }))} /></Field><Field label="Warna"><input type="color" value={certificatePlacement[key].color} onChange={(event) => setCertificatePlacement((current) => ({ ...current, [key]: { ...current[key], color: event.target.value } }))} /></Field></div></section>)}</>}</div>}

        {step === 7 && <div className="grid gap-5"><div className="rounded-2xl bg-primary-100 p-5"><h3 className="text-xl font-semibold">{form.title || "Judul event belum diisi"}</h3><p className="mt-2 text-sm text-content-body">{kind} · {form.type} · {form.category || "Bidang materi belum diisi"}</p></div><dl className="grid gap-px overflow-hidden rounded-2xl bg-primary-600/10 sm:grid-cols-2"><div className="bg-white p-4"><dt className="text-xs text-content-muted">Landing page</dt><dd className="mt-1 font-semibold">{blocks.filter((block) => block.visible).length} section</dd></div><div className="bg-white p-4"><dt className="text-xs text-content-muted">Tiket</dt><dd className="mt-1 font-semibold">{tickets.length} paket</dd></div><div className="bg-white p-4"><dt className="text-xs text-content-muted">Evaluasi</dt><dd className="mt-1 font-semibold">{[preTest.enabled && "Pre-test", postTest.enabled && "Post-test"].filter(Boolean).join(" & ") || "Nonaktif"}</dd></div><div className="bg-white p-4"><dt className="text-xs text-content-muted">Sertifikat</dt><dd className="mt-1 font-semibold">{form.certificateEnabled ? form.certificateTemplate ? "Template siap" : "Template belum diunggah" : "Nonaktif"}</dd></div></dl><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.publication === "published"} onChange={(event) => setField("publication", event.target.checked ? "published" : "draft")} />Publikasikan setelah menyimpan</label></div>}

        <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-primary-600/10 pt-6"><button type="button" disabled={step === 0} onClick={() => { setStep((current) => Math.max(0, current - 1)); setLandingSection(null); }} className="flow-button secondary"><ArrowLeft size={16} />Kembali</button><div className="flex flex-wrap gap-2"><button type="button" className="flow-button secondary" onClick={() => save(false)}><Save size={16} />Simpan draft</button><button type="submit" className="flow-button">{step === steps.length - 1 ? form.publication === "published" ? <><Send size={16} />Publish event</> : <><FileCheck2 size={16} />Simpan event</> : <>Lanjut<ArrowRight size={16} /></>}</button></div></div>
      </Panel>
    </form>
    {preview && <div role="dialog" aria-modal="true" aria-label="Pratinjau landing page" className="fixed inset-0 z-50 overflow-y-auto bg-white"><div className="sticky top-0 z-50 flex min-h-16 items-center justify-between gap-4 border-b border-primary-600/10 bg-white px-4 sm:px-6"><div><strong className="block text-sm">Pratinjau landing page</strong><span className="text-xs text-content-muted">{kind}</span></div><button type="button" onClick={() => setPreview(false)} className="flow-button secondary">Tutup</button></div><EventPresentation slug={buildEvent(false).slug} previewEvent={buildEvent(false)} /></div>}
  </div>;
}
