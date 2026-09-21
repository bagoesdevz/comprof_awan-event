import { Tickets } from "@/components/dashboard/tickets";
export default function Page({params}:{params:{id:string}}){return <Tickets id={params.id}/>;}
