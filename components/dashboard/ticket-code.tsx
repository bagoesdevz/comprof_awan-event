"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
export function TicketCode({value,size="md"}:{value:string;size?:"sm"|"md"|"lg"}){
 const [src,setSrc]=useState("");const [error,setError]=useState(false);
 useEffect(()=>{let active=true;QRCode.toDataURL(value,{width:448,margin:4,errorCorrectionLevel:"M",color:{dark:"#211052",light:"#ffffff"}}).then(url=>{if(active)setSrc(url)}).catch(()=>{if(active)setError(true)});return()=>{active=false}},[value]);
 const width=size==="lg"?224:size==="sm"?96:160;
 // Data URL is generated locally and contains the registration reference.
 return src?<img src={src} width={width} height={width} alt={"QR tiket "+value}/>:<p role="status">{error?"QR gagal dimuat. Gunakan kode tiket.":"Memuat QR…"}</p>;
}
