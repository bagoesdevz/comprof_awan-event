"use client";
import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { Eye, Pencil, PlusCircle, Save } from "lucide-react";
import { usePlatform } from "@/components/platform/provider";
import { readImage } from "@/components/platform/assets";
import { Badge, Field, PageHeading, Panel } from "@/components/platform/ui";
import { ArticleEditor } from "@/components/admin/article-editor";
import { type CmsArticle } from "@/lib/platform-model";

const sections = ["Home", "About", "Team", "Services", "Partners", "FAQ", "CTA", "Footer"];
const sectionLabels: Record<string, string> = { Home: "Pembuka", About: "Tentang kami", Team: "Tim", Services: "Layanan", Partners: "Mitra", FAQ: "Pertanyaan umum", CTA: "Ajakan program", Footer: "Footer" };

export default function AdminCmsPage() {
  const { state, update, saving } = usePlatform();
  const [section, setSection] = useState("Home");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState<"success" | "danger">("success");
  const [tab, setTab] = useState<"pages" | "articles">("pages");
  const [editingArticle, setEditingArticle] = useState<CmsArticle | null>(null);

  const value = state.cms[section] ?? { title: section, body: "", image: "", status: "Draft" };
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(state.cms[section] ?? { title: section, body: "", image: "", status: "Draft" });
  }, [section, state.cms]);

  function select(key: string) {
    setSection(key);
    setMode("edit");
    setNotice("");
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setNotice("");
    const payload = { ...draft, status: "Published" as const };
    const ok = await update((s) => {
      s.cms[section] = payload;
    });
    setNotice(ok ? "Konten tersimpan." : "Perubahan belum tersimpan. Coba lagi.");
    setNoticeTone(ok ? "success" : "danger");
  }

  function newArticle() {
    const id = crypto.randomUUID();
    const blank: CmsArticle = {
      id,
      slug: "artikel-baru-" + id.slice(0, 8),
      title: "Artikel baru",
      category: "",
      cover: "",
      content: "",
      excerpt: "",
      author: "",
      seoTitle: "",
      seoDescription: "",
      publishDate: new Date().toISOString().slice(0, 10),
      status: "Draft",
    };
    setEditingArticle(blank);
  }

  if (editingArticle) {
    return (
      <ArticleEditor
        article={editingArticle}
        onDone={() => setEditingArticle(null)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeading
        title="Konten website"
        description="Kelola halaman, artikel, dan media dari satu tempat."
        action={
          <a className="flow-button secondary" href="/" target="_blank" rel="noopener noreferrer">
            <Eye size={16} /> Buka website
          </a>
        }
      />

      <div className="flow-tabs" role="group" aria-label="Jenis konten">
        <button type="button" aria-pressed={tab === "pages"} onClick={() => setTab("pages")}>
          Halaman
        </button>
        <button type="button" aria-pressed={tab === "articles"} onClick={() => setTab("articles")}>
          Artikel ({state.articles.length})
        </button>
      </div>

      {tab === "pages" && (
        <>
          <div className="cms-section-picker mt-4" role="group" aria-label="Bagian halaman">
            {sections.map((x) => (
              <button
                key={x}
                type="button"
                aria-pressed={section === x}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  section === x
                    ? "bg-primary-950 text-white"
                    : "border-content-title/10 hover:bg-primary-50"
                }`}
                onClick={() => select(x)}
              >
                {sectionLabels[x]}
              </button>
            ))}
          </div>

          {notice && (
            <p className={`flow-alert mt-4 ${noticeTone}`} role={noticeTone === "danger" ? "alert" : "status"}>
              {notice}
            </p>
          )}

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
            {mode === "edit" ? (
              <Panel title={"Konten " + sectionLabels[section]}>
                <form onSubmit={save} className="grid gap-5">
                  <Field label="Judul">
                    <input
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      required
                    />
                  </Field>
                  <Field label="Isi konten">
                    <textarea
                      rows={9}
                      value={draft.body}
                      onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                      placeholder="Tulis konten dalam bahasa yang mudah dipahami."
                    />
                  </Field>
                  <Field label="Visual / cover">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setDraft({ ...draft, image: await readImage(file) });
                        } catch (err) {
                          setNoticeTone("danger");
                          setNotice((err as Error).message);
                        }
                      }}
                    />
                  </Field>
                  {draft.image && (
                    <div className="relative aspect-video overflow-hidden rounded-2xl">
                      <Image src={draft.image} unoptimized alt="Pratinjau visual" fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex flex-wrap justify-between gap-3 border-t pt-6">
                    <Badge tone={value.status === "Published" ? "success" : "warning"}>
                      {value.status === "Published" ? "Terbit" : "Draf"}
                    </Badge>
                    <button className="flow-button" disabled={saving}>
                      <Save size={16} />
                      {saving ? "Menyimpan…" : "Simpan & terbitkan"}
                    </button>
                  </div>
                </form>
              </Panel>
            ) : (
              <Panel title="Pratinjau konten">
                <div className="rounded-xl bg-surface-muted p-6">
                  <span className="text-xs font-medium text-content-muted">{sectionLabels[section]}</span>
                  <h2 className="mt-4 text-2xl font-semibold">{draft.title}</h2>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-content-body">
                    {draft.body || "Belum ada isi konten."}
                  </p>
                  {draft.image && <Image src={draft.image} unoptimized alt="Pratinjau visual" width={900} height={600} className="mt-6 max-h-80 w-full rounded-xl object-contain" />}
                </div>
              </Panel>
            )}

            <aside className="grid content-start gap-5">
              <Panel title="Tampilan">
                <button
                  type="button"
                  className="flow-button secondary w-full"
                  onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
                >
                  {mode === "edit" ? (
                    <>
                      <Eye size={16} /> Pratinjau
                    </>
                  ) : (
                    <>
                      <Pencil size={16} /> Edit
                    </>
                  )}
                </button>
              </Panel>
            </aside>
          </div>
        </>
      )}

      {tab === "articles" && (
        <div className="mt-6">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-content-muted">{state.articles.length} artikel terdaftar.</p>
            <button className="flow-button" onClick={newArticle}>
              <PlusCircle size={16} /> Artikel baru
            </button>
          </div>
          <div className="grid gap-3">
            {state.articles.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-2xl border border-content-title/10 bg-white p-4"
              >
                <div className="min-w-0">
                  <strong className="block truncate text-sm">{a.title}</strong>
                  <span className="mt-1 block text-xs text-content-muted">
                    {a.status} · {a.category} · {a.author}
                  </span>
                </div>
                <button
                  className="flow-button secondary ml-4 shrink-0"
                  onClick={() => setEditingArticle(a)}
                >
                  <Pencil size={14} /> Edit
                </button>
              </div>
            ))}
            {!state.articles.length && (
              <p className="rounded-2xl border border-dashed border-content-title/10 p-8 text-center text-sm text-content-muted">
                Belum ada artikel. Klik &quot;Artikel baru&quot; untuk memulai.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
