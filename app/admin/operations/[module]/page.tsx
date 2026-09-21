import {notFound} from "next/navigation";
import OperationsStudio from "@/components/admin/operations-studio";
const modules=["participants","finance","waitlist","evaluations","communications","leads","settings"];
export function generateStaticParams(){return modules.map(module=>({module}));}
export default function Page({params}:{params:{module:string}}){if(!modules.includes(params.module))notFound();return <OperationsStudio module={params.module}/>;}
