import { Tickets } from "@/components/dashboard/tickets";
export default async function Page({params}:{params: Promise<{id:string}>}){const route=await params;return <Tickets id={route.id}/>;}
