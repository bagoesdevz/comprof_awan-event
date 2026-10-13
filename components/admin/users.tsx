"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PageHeading, Panel, Field, Empty } from "@/components/platform/ui";

type Account = { id: string; email: string; name: string; role: string };

export function UsersAdmin() {
  const [users, setUsers] = useState<Account[]>([]);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/admin/users", { signal: AbortSignal.timeout(30000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Daftar akun belum dapat dimuat.");
      setUsers(data.users);
    } catch {
      setLoadError("Daftar akun belum dapat dimuat. Silakan coba lagi.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    const body = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Undangan belum berhasil dikirim.");
      setOpen(false); setNotice("Undangan berhasil dikirim."); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Undangan belum berhasil dikirim."); }
    finally { setBusy(false); }
  }

  return <div>
    <PageHeading title="Akun & peran" action={<button className="flow-button" type="button" aria-expanded={open} disabled={busy} onClick={() => { setOpen(value => !value); setError(""); setNotice(""); }}>{open ? "Tutup undangan" : "Undang akun"}</button>} />
    {error && <p className="flow-alert danger mb-5" role="alert">{error}</p>}
    {notice && <p className="flow-alert success mb-5" role="status">{notice}</p>}
    {open && <Panel title="Undang akun" className="mb-6"><form className="grid gap-5 sm:grid-cols-2" onSubmit={submit}>
      <Field label="Email"><input type="email" name="email" autoComplete="email" required /></Field>
      <Field label="Peran"><select name="role"><option value="participant">Peserta</option><option value="operational">Admin operasional</option><option value="super">Super admin</option></select></Field>
      <button className="flow-button" disabled={busy}>{busy ? "Mengirim…" : "Kirim undangan"}</button>
    </form></Panel>}
    <Panel>
      {loading ? <p role="status" aria-busy="true" className="py-8 text-sm text-content-muted">Memuat daftar akun…</p> : loadError ? <div role="alert"><p className="text-sm text-content-body">{loadError}</p><button className="flow-button secondary mt-5" type="button" onClick={() => void load()}>Muat ulang akun</button></div> : users.length ?
        <div className="flow-table-wrap"><table className="flow-table"><caption className="sr-only">Akun dan peran pengguna Awan Event</caption><thead><tr><th scope="col">Nama</th><th scope="col">Email</th><th scope="col">Peran</th></tr></thead><tbody>{users.map(user => <tr key={user.id}><td>{user.name || "Belum tersedia"}</td><td>{user.email}</td><td>{user.role === "super" ? "Super admin" : user.role === "operational" ? "Admin operasional" : "Peserta"}</td></tr>)}</tbody></table></div> :
        <Empty title="Belum ada akun" description="Undang pengguna untuk memberi akses sesuai perannya." />}
    </Panel>
  </div>;
}
