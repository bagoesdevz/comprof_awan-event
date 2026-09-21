import type { PlatformState } from "./platform-model";
export const collections=["events","profiles","registrations","notices","leads","waitlist","templates","campaigns","cms","articles"] as const;
export type Collection=typeof collections[number];
export type RecordRow={collection:Collection;id:string;data:Record<string,unknown>;owner_email:string|null;published:boolean;revision:number;created_at?:string;updated_at?:string};
export type Change={collection:Collection;id:string;data:Record<string,unknown>;revision:number};
export function stateRecords(state:PlatformState){
 const result=new Map<string,{collection:Collection;id:string;data:Record<string,unknown>}>();
 for(const collection of collections){
  const values=state[collection];
  const entries=Array.isArray(values)?values.map(v=>[v.id,v] as const):Object.entries(values);
  for(const [id,value] of entries){result.set(collection+":"+id,{collection,id,data:value as unknown as Record<string,unknown>})}
 }
 return result;
}
export function changesBetween(before:PlatformState,after:PlatformState,revisions:Record<string,number>):Change[]{
 const old=stateRecords(before),next=stateRecords(after);
 return [...next.entries()].filter(([k,v])=>JSON.stringify(old.get(k)?.data)!==JSON.stringify(v.data)).map(([k,v])=>({...v,revision:revisions[k]||0}));
}
