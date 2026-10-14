import { NextResponse } from "next/server";

export function publicEventUnavailable(status: 404 | 503) {
  const title = status === 404 ? "Tautan event tidak tersedia" : "Halaman event belum dapat dibuka";
  const description = status === 404 ? "Periksa kembali tautan Anda atau buka katalog untuk melihat event yang tersedia." : "Coba kembali beberapa saat lagi atau buka katalog event.";
  return new NextResponse(`<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title} | Awan Event</title><style>body{margin:0;background:#f8f9fc;color:#211052;font-family:system-ui,sans-serif;line-height:1.7}main{box-sizing:border-box;max-width:600px;margin:12vh auto;padding:32px}img{border-radius:50%}h1{font-size:clamp(26px,5vw,36px);line-height:1.3;margin:24px 0 12px}p{color:#5d607d;margin:0 0 24px}a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 24px;border-radius:12px;background:#5b3cc4;color:white;text-decoration:none;font-weight:600}a:focus-visible{outline:3px solid #5b3cc4;outline-offset:4px}</style></head><body><main><img src="/awan-event-logo.jpeg" width="56" height="56" alt="Awan Event"><h1>${title}</h1><p>${description}</p><a href="/events">Buka katalog event</a></main></body></html>`, {
    status, headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
    },
  });
}
