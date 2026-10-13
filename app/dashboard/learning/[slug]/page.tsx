import { redirect } from "next/navigation";
export default async function Page({params}:{params: Promise<{slug:string}>}){const route=await params;redirect("/dashboard/events/"+encodeURIComponent(route.slug));}
