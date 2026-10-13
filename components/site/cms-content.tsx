"use client";
import Image from "next/image";
import { usePlatform } from "@/components/platform/provider";

export function CmsContent({section,fallbackTitle,fallbackBody=[]}:{section:string;fallbackTitle?:string;fallbackBody?:readonly string[]}) {
 const {state}=usePlatform();const content=state.cms[section];
 if(!content&&!fallbackTitle)return null;
 return <div className="grid gap-6">
  <h2>{content?.title||fallbackTitle}</h2>
  {content?.body?<p className="whitespace-pre-line text-sm leading-7 text-content-body">{content.body}</p>:fallbackBody.map(paragraph=><p key={paragraph} className="text-sm leading-7 text-content-body">{paragraph}</p>)}
  {content?.image&&<Image src={content.image} unoptimized alt={content.title} width={1200} height={675} className="max-h-96 w-full rounded-2xl object-contain"/>}
 </div>;
}
