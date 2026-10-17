"use client";

import { useState } from "react";
import { usePlatform } from "@/components/platform/provider";
import { PageHeading, Panel, Empty, Field, Badge, exportCsv } from "@/components/platform/ui";
import { money, paymentLabels } from "@/lib/platform-model";

export function Transactions() {
  const { state } = usePlatform();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const orders = state.registrations.filter(registration => !registration.orderId);
  const rows = orders.filter(registration => (status === "all" || registration.payment === status) && [registration.name, registration.email, registration.id].join(" ").toLocaleLowerCase("id-ID").includes(query.trim().toLocaleLowerCase("id-ID")))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const filtered = Boolean(query.trim()) || status !== "all";
  function reset() { setQuery(""); setStatus("all"); }
  return <div>
    <PageHeading title="Transaksi" action={<button className="flow-button secondary" disabled={!rows.length} onClick={() => exportCsv("pembayaran", ["Pendaftaran", "Nama", "Email", "Jumlah", "Status"], rows.map(registration => [registration.id, registration.name, registration.email, registration.amount, paymentLabels[registration.payment]]))}>Ekspor CSV</button>} />
    <Panel>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <Field label="Cari transaksi"><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nama, email, atau nomor pendaftaran" /></Field>
        <Field label="Status"><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">Semua status</option>{Object.entries(paymentLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field>
      </div>
      <div className="admin-filter-summary"><span role="status">{rows.length} dari {orders.length} transaksi</span>{filtered && <button type="button" onClick={reset}>Hapus filter</button>}</div>
      {rows.length ? <div className="flow-table-wrap"><table className="flow-table"><caption className="sr-only">Transaksi sesuai pencarian dan status</caption><thead><tr><th scope="col">Pendaftaran</th><th scope="col">Peserta</th><th scope="col">Event</th><th scope="col">Jumlah</th><th scope="col">Status</th></tr></thead><tbody>{rows.map(registration => <tr key={registration.id}>
        <td>{registration.id}<small>{new Date(registration.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" })}</small></td>
        <td>{registration.name}<small>{registration.email}</small></td>
        <td>{state.events.find(event => event.slug === registration.eventSlug)?.title || registration.eventSlug}<small>{registration.ticketName}</small></td>
        <td>{money(registration.amount)}</td>
        <td><Badge tone={registration.payment === "paid" ? "success" : registration.payment === "pending" ? "warning" : registration.payment === "failed" || registration.payment === "expired" ? "danger" : "neutral"}>{paymentLabels[registration.payment]}</Badge></td>
      </tr>)}</tbody></table></div> : <Empty title={filtered ? "Tidak ada transaksi yang sesuai" : "Belum ada transaksi"} description={filtered ? "Ubah pencarian atau gunakan Hapus filter di atas." : "Transaksi akan muncul setelah peserta mendaftar."} />}
    </Panel>
  </div>;
}
