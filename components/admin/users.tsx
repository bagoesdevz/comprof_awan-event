"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { PageHeading, Panel, Field, Empty } from "@/components/platform/ui";
import { SelectInput } from "@/components/ui/select";

type Role = "participant" | "operational" | "super";
type Account = { id: string; email: string; name: string; role: Role };
const roleLabels: Record<Role, string> = { participant: "Peserta", operational: "Admin operasional", super: "Super admin" };

export function UsersAdmin() {
  const [users, setUsers] = useState<Account[]>([]);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [roleError, setRoleError] = useState("");
  const [draftRoles, setDraftRoles] = useState<Record<string, Role>>({});
  const [changingId, setChangingId] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const saving = busy || !!changingId;
  const loadVersion = useRef(0);

  const load = useCallback(async (requestedPage: number) => {
    const version = ++loadVersion.current;
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(`/api/admin/users?page=${requestedPage}`, { cache: "no-store", signal: AbortSignal.timeout(30000) });
      const data = await response.json();
      if (version !== loadVersion.current) return;
      if (!response.ok) throw new Error(data.error?.message || "Daftar akun belum dapat dimuat.");
      setUsers(data.users);
      setDraftRoles({}); setCurrentUserId(data.currentUserId); setHasNext(data.hasNext);
    } catch (cause) {
      if (version === loadVersion.current) setLoadError(cause instanceof Error ? cause.message : "Daftar akun belum dapat dimuat. Silakan coba lagi.");
    } finally { if (version === loadVersion.current) setLoading(false); }
  }, []);

  useEffect(() => { void load(page); }, [load, page]);

  async function changeRole(user: Account) {
    const role = draftRoles[user.id] || user.role;
    if (saving || role === user.role || user.id === currentUserId) return;
    setChangingId(user.id); setRoleError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role }), signal: AbortSignal.timeout(30000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Peran belum berhasil disimpan.");
      const updated: Account = data.user;
      setUsers(current => current.map(item => item.id === updated.id ? updated : item));
      setDraftRoles(current => { const next = { ...current }; delete next[user.id]; return next; });
      setNotice(`Peran ${updated.email || updated.name} berhasil diubah menjadi ${roleLabels[updated.role]}.`);
    } catch (cause) {
      setRoleError(cause instanceof Error && !["TimeoutError", "AbortError", "TypeError"].includes(cause.name)
        ? cause.message : "Perubahan belum dapat dikonfirmasi. Muat ulang akun sebelum mencoba lagi.");
    } finally { setChangingId(""); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setBusy(true); setError(""); setNotice("");
    const body = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Undangan belum berhasil dikirim.");
      setOpen(false); setNotice("Undangan berhasil dikirim."); await load(page);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Undangan belum berhasil dikirim."); }
    finally { setBusy(false); }
  }

  return <div>
    <PageHeading title="Akun & peran" description="Ubah peran akun terdaftar langsung di sini tanpa email undangan." action={<button className="flow-button secondary" type="button" aria-expanded={open} disabled={saving || loading} onClick={() => { setOpen(value => !value); setError(""); setNotice(""); }}>{open ? "Tutup undangan" : "Undang akun baru"}</button>} />
    {error && <p className="flow-alert danger mb-5" role="alert">{error}</p>}
    {notice && <p className="flow-alert success mb-5" role="status">{notice}</p>}
    {roleError && <p className="flow-alert danger mb-5" role="alert">{roleError}</p>}
    {open && <Panel title="Undang akun" className="mb-6"><form className="grid gap-5 sm:grid-cols-2" onSubmit={submit}>
      <Field label="Email"><input type="email" name="email" autoComplete="email" required disabled={saving} /></Field>
      <Field label="Peran"><select name="role" disabled={saving}><option value="participant">Peserta</option><option value="operational">Admin operasional</option><option value="super">Super admin</option></select></Field>
      <button className="flow-button" disabled={saving}>{busy ? "Mengirim…" : "Kirim undangan"}</button>
    </form></Panel>}
    <Panel title="Akun terdaftar" extra={<button className="flow-button secondary" type="button" disabled={loading || saving} onClick={() => void load(page)}>Muat ulang akun</button>}>
      {loading ? <p role="status" aria-busy="true" className="py-8 text-sm text-content-muted">Memuat daftar akun…</p> : loadError ? <p role="alert" className="text-sm text-content-body">{loadError}</p> : users.length ?
        <><div className="flow-table-wrap"><table className="flow-table"><caption className="sr-only">Akun dan peran pengguna Awan Event</caption><thead><tr><th scope="col">Nama</th><th scope="col">Email</th><th scope="col">Peran</th><th scope="col">Tindakan</th></tr></thead><tbody>{users.map(user => <tr key={user.id}><td>{user.name || "Belum tersedia"}</td><td>{user.email || "Tanpa email"}</td><td>{user.id === currentUserId ? roleLabels[user.role] : <div className="flow-field"><SelectInput aria-label={`Peran untuk ${user.email || user.id}`} value={draftRoles[user.id] || user.role} disabled={saving} onValueChange={value => { setDraftRoles(current => ({ ...current, [user.id]: value as Role })); setRoleError(""); setNotice(""); }}>{Object.entries(roleLabels).map(([role, label]) => <option key={role} value={role}>{label}</option>)}</SelectInput></div>}</td><td>{user.id === currentUserId ? <span className="text-xs text-content-muted">Akun Anda</span> : <button type="button" className="flow-button secondary" aria-label={`Simpan peran ${user.email || user.id}`} disabled={saving || !draftRoles[user.id] || draftRoles[user.id] === user.role} onClick={() => void changeRole(user)}>{changingId === user.id ? "Menyimpan…" : "Simpan"}</button>}</td></tr>)}</tbody></table></div><p className="mt-4 text-xs leading-6 text-content-muted">Perubahan berlaku saat pengguna memuat ulang halaman. Peran akun sendiri tidak dapat diubah di sini.</p></> :
        <Empty title={page === 1 ? "Belum ada akun" : "Tidak ada akun di halaman ini"} description="Pengguna yang sudah mendaftar akan muncul di daftar ini." />}
      {!loading && !loadError && <nav className="mt-6 flex flex-wrap items-center justify-between gap-3" aria-label="Halaman daftar akun"><span className="text-sm text-content-muted">Halaman {page}</span><div className="flex flex-wrap gap-2"><button type="button" className="flow-button secondary" disabled={saving || page === 1} onClick={() => setPage(current => current - 1)}>Sebelumnya</button><button type="button" className="flow-button secondary" disabled={saving || !hasNext} onClick={() => setPage(current => current + 1)}>Berikutnya</button></div></nav>}
    </Panel>
  </div>;
}
