import {notFound} from "next/navigation";
import OperationsStudio from "@/components/admin/operations-studio";
const modules=["participants","finance","waitlist","evaluations","communications","leads","settings"];
export function generateStaticParams(){return modules.map(module=>({module}));}
export default async function Page({params}:{params: Promise<{module:string}>}){const route=await params;if(!modules.includes(route.module))notFound();return <OperationsStudio module={route.module}/>;}
