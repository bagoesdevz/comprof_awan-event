"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlatform } from "./provider";
import { Field, Panel } from "./ui";
import { profileComplete, safeNext, type Profile } from "@/lib/platform-model";
import { mergeProfileDraft } from "@/lib/profile-draft";
import { Disclosure } from "@/components/ui/disclosure";

const genderOptions = [["male", "Laki-laki"], ["female", "Perempuan"], ["prefer_not_to_say", "Memilih tidak menjawab"]] as const;
const sourceOptions = ["Instagram", "LinkedIn", "WhatsApp", "Rekomendasi teman atau kolega", "Pencarian Google", "Lainnya"] as const;

export function ProfileEditor({ registrationEventTitle, onComplete }: { registrationEventTitle?: string; onComplete?: () => void } = {}) {
  const { state, ready, update, error, refresh } = usePlatform();
  const router = useRouter();
  const email = state.session.email;
  const savedProfile = state.profiles[email];
  const edited = useRef(new Set<keyof Profile>());
  const formAccount = useRef<string | null>(ready ? email : null);
  const [form, setForm] = useState<Profile>(() => mergeProfileDraft(email, savedProfile));
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [required, setRequired] = useState(false);
  const registration = registrationEventTitle !== undefined;
  const admin = !registration && state.session.role !== "participant";
  const roleLabel = state.session.role === "super" ? "Super Admin" : state.session.role === "operational" ? "Admin Operasional" : "Peserta";
  const hasChanges = edited.current.size > 0;

  useEffect(() => {
    if (ready) {
      setRequired(!admin && (registration || new URLSearchParams(window.location.search).get("required") === "1"));
      const accountChanged = formAccount.current !== email;
      if (accountChanged) { edited.current.clear(); formAccount.current = email; setNotice(""); setFailed(false); }
      setForm(current => mergeProfileDraft(email, savedProfile, accountChanged ? undefined : current, edited.current));
    }
  }, [ready, email, savedProfile, registration, admin]);

  function setField<Key extends keyof Profile>(key: Key, value: Profile[Key]) {
    edited.current.add(key);
    setNotice(""); setFailed(false);
    setForm((current) => ({ ...current, [key]: value }));
  }

  function cancelChanges() {
    edited.current.clear();
    setForm(mergeProfileDraft(email, savedProfile));
    setNotice(""); setFailed(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || !state.session.loggedIn || form.email !== email || saving) return;
    setSaving(true);
    setNotice(""); setFailed(false);
    const submitted = { ...form }, fields = new Set(edited.current);
    let saved = false, accountChanged = false;
    try {
      saved = await update((draft) => {
        if (!draft.session.loggedIn || draft.session.email !== email) { accountChanged = true; return; }
        draft.profiles[email] = mergeProfileDraft(email, draft.profiles[email], submitted, fields);
      });
      if (formAccount.current !== email) return;
      if (!saved || accountChanged) { setFailed(true); return; }
      edited.current.clear();
    } catch { setFailed(true); return; }
    finally { setSaving(false); }
    if (!saved) return;
    if (registration) { onComplete?.(); return; }
    setNotice("Perubahan profil berhasil disimpan.");
    const next = new URLSearchParams(window.location.search).get("next");
    if (next && !admin) router.push(safeNext(next));
    else if (required) router.replace("/dashboard/profile");
  }

  const age = form.birthDate ? Math.floor((Date.now() - new Date(form.birthDate).getTime()) / 31557600000) : null;

  if (!ready || !state.session.loggedIn || form.email !== email) return error ? <Panel><div role="alert"><p>Profil belum dapat dimuat. Coba muat ulang data.</p><button type="button" className="flow-button mt-4" onClick={()=>void refresh()}>Muat ulang profil</button></div></Panel> : <p role="status">Menyiapkan data profil…</p>;

  return (
    <div className="profile-onboarding mx-auto max-w-4xl">
      {required && !profileComplete(form) && !registration && <div className="profile-required-notice" role="status"><strong>Lengkapi profil Anda terlebih dahulu.</strong><span>Data ini digunakan untuk pendaftaran event, komunikasi, dan penerbitan sertifikat.</span></div>}
      <div className="profile-onboarding-heading"><p className="profile-onboarding-kicker">{registration ? "Data peserta" : admin ? "Akun admin" : "Akun peserta"}</p>{registration ? <h2>Lengkapi data pendaftaran</h2> : <h1>{required ? "Lengkapi profil Anda" : "Profil saya"}</h1>}<p>{registration ? `Isi data peserta untuk ${registrationEventTitle}. Setelah disimpan, lanjutkan konfirmasi dan pilih tiket di halaman ini.` : admin ? "Perbarui nama dan kontak Anda untuk koordinasi tim Awan Event." : "Perbarui data diri untuk pendaftaran, komunikasi event, dan penerbitan sertifikat."}</p></div>
      {!registration && <div className="profile-account-summary"><span className="profile-account-initials" aria-hidden="true">{(savedProfile?.name || "Awan Event").trim().split(/\s+/).slice(0,2).map(part=>part[0]).join("")}</span><div><strong>{savedProfile?.name || "Akun Awan Event"}</strong><span>{roleLabel}</span></div></div>}
      {notice && <p role="status" className="flow-alert success mb-6">{notice}</p>}
      {failed && <p role="alert" className="flow-alert danger mb-6">{error || "Data belum tersimpan. Isian Anda tetap ada, silakan coba simpan lagi."}</p>}
      <Panel title="Informasi utama">
        <form onSubmit={submit} className="profile-onboarding-form">
          <fieldset disabled={saving} aria-busy={saving} aria-label={admin ? "Informasi pribadi admin" : "Informasi pribadi peserta"} className="min-w-0">
          <div className="profile-onboarding-grid">
            <Field label="Nama lengkap *"><input value={form.name} autoComplete="name" required minLength={2} maxLength={254} onChange={(event) => setField("name", event.target.value)} /></Field>
            <Field label="Email akun"><input value={form.email} type="email" disabled aria-describedby="profile-email-note" /><small id="profile-email-note">Email mengikuti akun yang digunakan untuk masuk.</small></Field>
            <Field label={admin ? "No. WhatsApp" : "No. WhatsApp *"}><input value={form.phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="08xxxxxxxxxx" required={!admin} minLength={8} maxLength={254} onChange={(event) => setField("phone", event.target.value)} /></Field>
            {admin ? <>
              <Field label="Institusi atau perusahaan"><input value={form.institution} maxLength={254} autoComplete="organization" onChange={(event)=>setField("institution",event.target.value)} /></Field>
              <Field label="Jabatan"><input value={form.position} maxLength={254} autoComplete="organization-title" onChange={(event)=>setField("position",event.target.value)} /></Field>
              <Field label="Domisili"><input value={form.city} maxLength={254} autoComplete="address-level2" placeholder="Kota atau kabupaten" onChange={(event)=>setField("city",event.target.value)} /></Field>
            </> : <>
              <Field label="Jenis kelamin *"><select value={form.gender} required onChange={(event) => setField("gender", event.target.value)}><option value="">Pilih jenis kelamin</option>{genderOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
              <Field label="Tempat lahir *"><input value={form.birthPlace} autoComplete="address-level2" required minLength={2} maxLength={254} onChange={(event) => setField("birthPlace", event.target.value)} /></Field>
              <Field label="Tanggal lahir *" hint={age !== null ? `Usia: ${age} tahun` : undefined}><input value={form.birthDate} type="date" required max={new Date().toISOString().slice(0, 10)} onChange={(event) => setField("birthDate", event.target.value)} /></Field>
              <Field label="Domisili *"><input value={form.city} autoComplete="address-level2" placeholder="Kota atau kabupaten" required minLength={2} maxLength={254} onChange={(event) => setField("city", event.target.value)} /></Field>
              <Field label="Profesi *"><input value={form.profession} autoComplete="organization-title" required minLength={2} maxLength={254} onChange={(event) => setField("profession", event.target.value)} /></Field>
              <Field label={registration ? "Mengetahui event dari *" : "Info webinar dari *"}><select value={form.source} required onChange={(event) => setField("source", event.target.value)}><option value="">Pilih sumber informasi</option>{sourceOptions.map((source) => <option key={source} value={source}>{source}</option>)}</select></Field>
            </>}
          </div>
          {!admin && <Disclosure className="profile-extra-details" title="Data tambahan (opsional)"><div className="profile-onboarding-grid mt-5"><Field label="Institusi atau perusahaan"><input value={form.institution} maxLength={254} onChange={(event) => setField("institution", event.target.value)} /></Field><Field label="Jabatan"><input value={form.position} maxLength={254} onChange={(event) => setField("position", event.target.value)} /></Field><Field label="Provinsi"><input value={form.province} maxLength={254} autoComplete="address-level1" onChange={(event) => setField("province", event.target.value)} /></Field><Field label="Alamat"><input value={form.address} maxLength={10000} autoComplete="street-address" onChange={(event) => setField("address", event.target.value)} /></Field><Field label="Bidang atau spesialisasi"><input value={form.specialization} maxLength={254} onChange={(event) => setField("specialization", event.target.value)} /></Field></div></Disclosure>}
          <div className="profile-onboarding-actions"><p>{hasChanges ? "Ada perubahan yang belum disimpan." : registration ? "Kolom bertanda * wajib diisi. Menyimpan data belum mendaftarkan Anda ke event." : "Kolom bertanda * wajib diisi."}</p><div className="profile-edit-actions">{!registration && hasChanges && <button type="button" className="flow-button secondary" onClick={cancelChanges}>Batalkan perubahan</button>}<button className="flow-button" disabled={saving || (!registration && !hasChanges)}>{saving ? "Menyimpan…" : registration ? "Simpan data & lanjutkan" : "Simpan profil"}</button></div></div>
          </fieldset>
        </form>
      </Panel>
      {!registration && <Panel title="Keamanan akun" className="profile-security-panel"><p className="text-sm leading-7 text-content-muted">Untuk memperbarui kata sandi, minta tautan pemulihan melalui email akun Anda.</p><Link href="/forgot-password" className="flow-button secondary mt-4">Ubah kata sandi</Link></Panel>}
    </div>
  );
}
