"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { usePlatform } from "./provider";
import { Field, Panel } from "./ui";
import { blankProfile, defaultProfile, profileComplete, safeNext, type Profile } from "@/lib/platform-model";

const genderOptions = [["male", "Laki-laki"], ["female", "Perempuan"], ["prefer_not_to_say", "Memilih tidak menjawab"]] as const;
const sourceOptions = ["Instagram", "LinkedIn", "WhatsApp", "Rekomendasi teman atau kolega", "Pencarian Google", "Lainnya"] as const;

export function ProfileEditor() {
  const { state, ready, update } = usePlatform();
  const router = useRouter();
  const [form, setForm] = useState<Profile>(defaultProfile);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [required, setRequired] = useState(false);

  useEffect(() => {
    if (ready) {
      setRequired(new URLSearchParams(window.location.search).get("required") === "1");
      setForm({ ...blankProfile(state.session.email), ...(state.profiles[state.session.email] || {}) });
    }
  }, [ready, state.session.email, state.profiles]);

  function setField<Key extends keyof Profile>(key: Key, value: Profile[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    const saved = await update((draft) => {
      draft.profiles[draft.session.email] = { ...form, email: draft.session.email };
    });
    setSaving(false);
    if (!saved) return;
    setNotice("Profil tersimpan. Anda siap mengikuti event Awan Event.");
    const next = new URLSearchParams(window.location.search).get("next");
    if (next) router.push(safeNext(next));
    else if (required) router.replace("/dashboard/profile");
  }

  const age = form.birthDate ? Math.floor((Date.now() - new Date(form.birthDate).getTime()) / 31557600000) : null;

  return (
    <div className="profile-onboarding mx-auto max-w-4xl">
      {required && !profileComplete(form) && <div className="profile-required-notice" role="status"><strong>Lengkapi profil Anda terlebih dahulu.</strong><span>Data ini digunakan untuk pendaftaran event, komunikasi, dan penerbitan sertifikat.</span></div>}
      <div className="profile-onboarding-heading"><p className="profile-onboarding-kicker">Akun peserta</p><h1>Kenali diri Anda lebih baik.</h1><p>Lengkapi data singkat ini agar pengalaman event dan sertifikat Anda tercatat dengan tepat.</p></div>
      {notice && <p role="status" className="flow-alert success mb-6">{notice}</p>}
      <Panel title="Informasi utama">
        <form onSubmit={submit} className="profile-onboarding-form">
          <div className="profile-onboarding-grid">
            <Field label="Nama lengkap *"><input value={form.name} autoComplete="name" required onChange={(event) => setField("name", event.target.value)} /></Field>
            <Field label="Email akun"><input value={form.email} type="email" disabled aria-describedby="profile-email-note" /><small id="profile-email-note">Email mengikuti akun yang digunakan untuk masuk.</small></Field>
            <Field label="No. WhatsApp *"><input value={form.phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="08xxxxxxxxxx" required onChange={(event) => setField("phone", event.target.value)} /></Field>
            <Field label="Jenis kelamin *"><select value={form.gender} required onChange={(event) => setField("gender", event.target.value)}><option value="">Pilih jenis kelamin</option>{genderOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <Field label="Tempat lahir *"><input value={form.birthPlace} autoComplete="address-level2" required onChange={(event) => setField("birthPlace", event.target.value)} /></Field>
            <Field label="Tanggal lahir *" hint={age !== null ? `Usia: ${age} tahun` : undefined}><input value={form.birthDate} type="date" required max={new Date().toISOString().slice(0, 10)} onChange={(event) => setField("birthDate", event.target.value)} /></Field>
            <Field label="Domisili *"><input value={form.city} autoComplete="address-level2" placeholder="Kota atau kabupaten" required onChange={(event) => setField("city", event.target.value)} /></Field>
            <Field label="Profesi *"><input value={form.profession} autoComplete="organization-title" required onChange={(event) => setField("profession", event.target.value)} /></Field>
            <Field label="Info webinar dari *"><select value={form.source} required onChange={(event) => setField("source", event.target.value)}><option value="">Pilih sumber informasi</option>{sourceOptions.map((source) => <option key={source} value={source}>{source}</option>)}</select></Field>
          </div>
          <details className="profile-extra-details"><summary>Data tambahan (opsional)</summary><div className="profile-onboarding-grid mt-5"><Field label="Institusi atau perusahaan"><input value={form.institution} onChange={(event) => setField("institution", event.target.value)} /></Field><Field label="Jabatan"><input value={form.position} onChange={(event) => setField("position", event.target.value)} /></Field><Field label="Provinsi"><input value={form.province} autoComplete="address-level1" onChange={(event) => setField("province", event.target.value)} /></Field><Field label="Alamat"><input value={form.address} autoComplete="street-address" onChange={(event) => setField("address", event.target.value)} /></Field><Field label="Bidang atau spesialisasi"><input value={form.specialization} onChange={(event) => setField("specialization", event.target.value)} /></Field></div></details>
          <div className="profile-onboarding-actions"><p>Kolom bertanda * wajib diisi.</p><button className="flow-button" disabled={saving}>{saving ? "Menyimpan…" : "Simpan profil"}</button></div>
        </form>
      </Panel>
    </div>
  );
}
