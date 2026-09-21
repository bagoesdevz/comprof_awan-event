"use client";
import Link from "next/link";
import {usePlatform} from "@/components/platform/provider";
import {Empty} from "@/components/platform/ui";
export function Articles({slug}:{slug?:string}){
 const {state,ready}=usePlatform();const articles=state.articles.filter(a=>a.status==="Published");
 if(!ready)return <p role="status">Memuat artikel…</p>;
 if(slug){const article=articles.find(a=>a.slug===slug);if(!article)return <Empty title="Artikel tidak ditemukan" href="/articles" label="Lihat artikel"/>;return <article className="mx-auto max-w-3xl"><h1 className="text-4xl font-semibold">{article.title}</h1><p className="my-6 text-sm text-content-muted">{article.author} · {article.publishDate}</p>{article.cover&&<img src={article.cover} alt="" className="mb-8 aspect-video w-full rounded-xl object-cover"/>}<div className="whitespace-pre-line text-base leading-8">{article.content}</div></article>}
 return articles.length?<div className="grid gap-8 md:grid-cols-2">{articles.map(a=><article key={a.id} className="border-t border-primary-100 pt-6"><p className="text-sm text-content-muted">{a.category}</p><h2 className="my-3 text-2xl font-semibold"><Link href={"/articles/"+a.slug}>{a.title}</Link></h2><p className="text-content-body">{a.excerpt}</p><Link href={"/articles/"+a.slug} className="mt-5 inline-flex min-h-11 items-center font-semibold text-primary-700">Baca artikel</Link></article>)}</div>:<Empty title="Belum ada artikel"/>;
}
