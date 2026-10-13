"use client";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { Children, cloneElement, isValidElement, useId, type ReactNode, type ReactElement } from "react";
export function PageHeading({title,description,action}:{eyebrow?:string;title:string;description?:string;action?:ReactNode}){return <header className="flow-heading"><div><h1>{title}</h1>{description&&<p>{description}</p>}</div>{action}</header>;}
export function Panel({title,children,extra,className=""}:{title?:string;children:ReactNode;extra?:ReactNode;className?:string}){return <section className={"flow-panel "+className}>{title&&<div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold tracking-tight">{title}</h2>{extra}</div>}{children}</section>;}
export function Empty({title,description,href,label="Lihat event"}:{title:string;description?:string;href?:string;label?:string}){return <div className="flow-empty"><Inbox className="mx-auto mb-4 h-8 w-8 text-primary-400"/><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 text-sm text-content-muted">{description}</p>{href&&<Link className="flow-button mt-5" href={href}>{label}</Link>}</div>;}
export function Badge({children,tone="neutral"}:{children:ReactNode;tone?:"neutral"|"success"|"warning"|"danger"}){return <span className={"flow-badge "+tone}>{children}</span>;}
export function Field({label,children,hint,className=""}:{label:string;children:ReactNode;hint?:string;className?:string}){
 const id=useId();
 const controls=Children.map(children,child=>{
  if(!isValidElement(child)||!["input","select","textarea"].includes(String(child.type)))return child;
  const control=child as ReactElement<{"aria-labelledby"?:string;"aria-label"?:string;"aria-describedby"?:string}>;
  return cloneElement(control,{
   ...(!control.props["aria-label"]&&!control.props["aria-labelledby"]&&label?{"aria-labelledby":id+"-label"}:{}),
   ...(hint?{"aria-describedby":[control.props["aria-describedby"],id+"-hint"].filter(Boolean).join(" ")}:{}),
  });
 });
 return <div className={"flow-field "+className}>{label&&<span id={id+"-label"}>{label}</span>}{controls}{hint&&<small id={id+"-hint"}>{hint}</small>}</div>;
}
export function exportCsv(name:string,headers:readonly string[],rows:(string|number)[][]){
 const cell=(v:string|number)=>{let s=String(v);if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 const blob=new Blob(["\ufeff"+[headers,...rows].map(row=>row.map(cell).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name+".csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
