"use client";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { usePlatform } from "@/components/platform/provider";
import { readImage } from "@/components/platform/assets";
import { Badge, Field, PageHeading, Panel } from "@/components/platform/ui";
import { type CmsArticle } from "@/lib/platform-model";

const CATEGORIES = ["Berita", "Tips & Trik", "Insight", "Panduan", "Studi Kasus"];
const STATUSES: CmsArticle["status"][] = ["Draft", "Review", "Published", "Archived"];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 120);
}

export function ArticleEditor({
  article,
  onDone,
}: {
  article: CmsArticle;
  onDone: () => void;
}) {
  const { state, update, saving } = usePlatform();
  const [draft, setDraft] = useState<CmsArticle>(article);
  const [notice, setNotice] = useState("");
  const isNew = !state.articles.find((a) => a.id === article.id);

  function set<K extends keyof CmsArticle>(key: K, value: CmsArticle[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function handleTitleChange(title: string) {
    setDraft((d) => ({
      ...d,
      title,
      slug: d.slug === slugify(d.title) || isNew ? slugify(title) : d.slug,
      seoTitle: d.seoTitle === d.title || isNew ? title : d.seoTitle,
    }));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setNotice("");
    const next: CmsArticle = { ...draft };
    const ok = await update((s) => {
      const idx = s.articles.findIndex((a) => a.id === next.id);
      if (idx >= 0) s.articles[idx] = next;
      else s.articles.unshift(next);
    });
    if (ok) {
      setNotice("Artikel tersimpan.");
    } else {
      setNotice("Gagal menyimpan — coba lagi.");
    }
  }

  const statusTone: Record<CmsArticle["status"], "neutral" | "warning" | "success" | "danger"> = {
    Draft: "neutral",
    Review: "warning",
    Published: "success",
    Archived: "danger",
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeading
        title={isNew ? "Artikel baru" : "Edit artikel"}
        description={draft.title || "Tulis konten untuk website Awan Event."}
        action={
          <button type="button" className="flow-button secondary" onClick={onDone}>
            <ArrowLeft size={16} /> Kembali
          </button>
        }
      />

      {notice && (
        <p
          className={`flow-alert mt-4 ${notice.startsWith("Gagal") ? "danger" : "success"}`}
          role="status"
        >
          {notice}
        </p>
      )}

      <form onSubmit={save} className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid gap-5">
          <Panel title="Konten artikel">
            <div className="grid gap-5">
              <Field label="Judul">
                <input
                  value={draft.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Judul artikel yang jelas dan informatif"
                  required
                />
              </Field>
              <Field label="Slug URL" hint="Hanya huruf kecil, angka, dan tanda hubung.">
                <input
                  value={draft.slug}
                  onChange={(e) => set("slug", e.target.value.replace(/[^a-z0-9-]/g, ""))}
                  required
                />
              </Field>
              <Field label="Kutipan / excerpt" hint="Ditampilkan di daftar artikel dan meta description.">
                <textarea
                  rows={3}
                  value={draft.excerpt}
                  onChange={(e) => set("excerpt", e.target.value)}
                  placeholder="1–2 kalimat ringkasan artikel."
                  maxLength={300}
                />
              </Field>
              <Field label="Isi artikel">
                <textarea
                  rows={14}
                  value={draft.content}
                  onChange={(e) => set("content", e.target.value)}
                  placeholder="Tulis isi artikel di sini. Markdown didukung bila renderer tersedia."
                  className="font-mono text-xs"
                />
              </Field>
              <Field label="Cover / gambar utama">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      set("cover", await readImage(file));
                    } catch (err) {
                      setNotice((err as Error).message);
                    }
                  }}
                />
                {draft.cover && (
                  <p className="mt-1 break-all font-mono text-[10px] text-content-muted">
                    {draft.cover.startsWith("data:") ? "Data URL (upload ke storage sebelum publish)" : draft.cover}
                  </p>
                )}
              </Field>
            </div>
          </Panel>
        </div>

        <aside className="grid content-start gap-5">
          <Panel title="Penerbitan">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-content-muted">Status</span>
                <Badge tone={statusTone[draft.status]}>{draft.status}</Badge>
              </div>
              <Field label="">
                <select
                  value={draft.status}
                  onChange={(e) => set("status", e.target.value as CmsArticle["status"])}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tanggal terbit">
                <input
                  type="date"
                  value={draft.publishDate.slice(0, 10)}
                  onChange={(e) => set("publishDate", e.target.value)}
                />
              </Field>
              <Field label="Kategori">
                <select
                  value={draft.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  <option value="">Pilih kategori</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Penulis">
                <input
                  value={draft.author}
                  onChange={(e) => set("author", e.target.value)}
                  placeholder="Nama penulis"
                />
              </Field>
            </div>
          </Panel>

          <Panel title="SEO">
            <div className="grid gap-4">
              <Field label="SEO title">
                <input
                  value={draft.seoTitle}
                  onChange={(e) => set("seoTitle", e.target.value)}
                  placeholder="Judul untuk mesin pencari"
                  maxLength={70}
                />
              </Field>
              <Field label="SEO description">
                <textarea
                  rows={3}
                  value={draft.seoDescription}
                  onChange={(e) => set("seoDescription", e.target.value)}
                  placeholder="Deskripsi untuk mesin pencari (maks 160 karakter)"
                  maxLength={160}
                />
              </Field>
            </div>
          </Panel>

          <button type="submit" className="flow-button w-full" disabled={saving}>
            <Save size={16} />
            {saving ? "Menyimpan…" : "Simpan artikel"}
          </button>

          {!isNew && (
            <button
              type="button"
              className="flow-button secondary w-full"
              onClick={onDone}
            >
              Batal
            </button>
          )}
        </aside>
      </form>
    </div>
  );
}
