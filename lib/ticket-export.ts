import QRCode from "qrcode";
import { ticketSchedule, type AdmissionTicket } from "@/lib/admission-ticket";

function image(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const item = new Image();
    item.onload = () => resolve(item);
    item.onerror = () => reject(new Error("Gambar tiket belum dapat disiapkan. Coba lagi."));
    item.src = src;
  });
}

function lines(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const result: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (ctx.measureText(word).width > width) {
      if (line) result.push(line);
      line = "";
      for (const character of word) {
        if (line && ctx.measureText(line + character).width > width) { result.push(line); line = ""; }
        line += character;
      }
    } else if (line && ctx.measureText(line + " " + word).width > width) {
      result.push(line); line = word;
    } else line += (line ? " " : "") + word;
  }
  if (line) result.push(line);
  return result.length ? result : [""];
}

export async function ticketImage(ticket: AdmissionTicket): Promise<Blob> {
  await document.fonts.ready;
  const [qr, logo] = await Promise.all([
    QRCode.toDataURL(ticket.reference, { width: 480, margin: 4, errorCorrectionLevel: "M", color: { dark: "#211052", light: "#ffffff" } }).then(image),
    image("/awan-event-logo.jpeg").catch(() => null),
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Peramban belum dapat membuat gambar tiket.");
  const font = '"Inter Variable", Inter, Arial, sans-serif';
  const setFont = (size: number, weight = 500) => { ctx.font = `${weight} ${size}px ${font}`; };
  setFont(52, 700);
  const title = lines(ctx, ticket.eventTitle, 1056);
  const headerHeight = 208 + title.length * 66;
  const schedule = ticketSchedule(ticket);
  const fields = [
    { label: "Nama peserta", value: ticket.participant, size: 42, weight: 650 },
    { label: "Jenis tiket", value: ticket.ticketName, size: 30, weight: 500 },
    { label: "Tanggal", value: schedule.date, size: 30, weight: 600 },
    { label: "Waktu", value: schedule.time, size: 30, weight: 500 },
    { label: ticket.attendance === "ONSITE" ? "Lokasi" : "Pelaksanaan", value: ticket.location, size: 30, weight: 500 },
  ].map(field => { setFont(field.size, field.weight); return { ...field, lines: lines(ctx, field.value, 1056) }; });
  const detailsHeight = fields.reduce((total, field) => total + 38 + field.lines.length * (field.size + 14) + 34, 0);
  const stubTop = headerHeight + 52 + detailsHeight;
  canvas.height = stubTop + 760;
  ctx.textBaseline = "top";
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#5031ad"; ctx.fillRect(0, 0, 1200, headerHeight);
  ctx.save(); ctx.globalAlpha = .12; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3;
  for (const [x, y, radius] of [[1090, 120, 108], [1190, 125, 76], [1020, 160, 60]]) {
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = "#ffffff";
  if (logo) {
    ctx.save(); ctx.beginPath(); ctx.arc(110, 92, 40, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(logo, 70, 52, 80, 80); ctx.restore();
  }
  setFont(34, 700); ctx.fillText("Awan Event", logo ? 170 : 72, 72);
  setFont(24); ctx.textAlign = "right";
  ctx.fillText(ticket.attendance === "ONSITE" ? "Tiket tatap muka" : "Tiket online", 1128, 82);
  ctx.textAlign = "left"; setFont(52, 700);
  title.forEach((line, index) => ctx.fillText(line, 72, 166 + index * 66));
  let y = headerHeight + 52;
  for (const field of fields) {
    setFont(22); ctx.fillStyle = "#65636c"; ctx.fillText(field.label, 72, y); y += 38;
    setFont(field.size, field.weight); ctx.fillStyle = "#211052";
    field.lines.forEach(line => { ctx.fillText(line, 72, y); y += field.size + 14; });
    y += 34;
  }
  ctx.fillStyle = "#f5f1fc"; ctx.fillRect(0, stubTop, 1200, 760);
  ctx.strokeStyle = "#b9a8d9"; ctx.lineWidth = 2; ctx.setLineDash([12, 10]);
  ctx.beginPath(); ctx.moveTo(40, stubTop); ctx.lineTo(1160, stubTop); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = "#211052"; ctx.textAlign = "center"; setFont(28, 650); ctx.fillText("QR tiket", 600, stubTop + 40);
  ctx.drawImage(qr, 360, stubTop + 94, 480, 480);
  ctx.font = '500 28px "DM Mono", monospace'; ctx.fillText(ticket.reference, 600, stubTop + 594);
  setFont(24, 600); ctx.fillText(ticket.status, 600, stubTop + 646);
  setFont(22); ctx.fillStyle = "#65636c";
  ctx.fillText(ticket.attendance === "ONSITE" ? "Tunjukkan QR ini kepada petugas saat check-in." : "Simpan sebagai bukti keikutsertaan Anda.", 600, stubTop + 696);
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Tiket belum dapat diunduh. Coba lagi.")), "image/png"));
}

export async function downloadTicket(ticket: AdmissionTicket) {
  const blob = await ticketImage(ticket);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = `tiket-${ticket.reference}.png`;
  document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}
