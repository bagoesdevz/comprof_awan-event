import "server-only";
import { timingSafeEqual } from "node:crypto";
import { HttpError } from "./http";

export function requireCron(request: Request) {
 const secret=process.env.CRON_SECRET;
 if(!secret)throw new HttpError(503,"Pemicu otomatis belum dikonfigurasi.");
 const expected=Buffer.from(`Bearer ${secret}`),received=Buffer.from(request.headers.get("authorization")||"");
 if(expected.length!==received.length||!timingSafeEqual(expected,received))throw new HttpError(401,"Akses ditolak.");
}
