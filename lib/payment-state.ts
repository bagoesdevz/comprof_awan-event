import type { PaymentStatus } from "@/lib/platform-model";

export function providerPaymentStatus(status: string, fraudStatus?: string): PaymentStatus | null {
  if (status === "settlement" || (status === "capture" && fraudStatus === "accept")) return "paid";
  if (status === "deny" || status === "failure") return "pending";
  if (status === "expire") return "expired";
  if (status === "cancel") return "cancelled";
  if (status === "refund") return "refunded";
  if (status === "pending" || status === "authorize" || (status === "capture" && fraudStatus === "challenge")) return "pending";
  return null;
}

export function canChangePayment(current: PaymentStatus, next: PaymentStatus) {
  if (current === next || current === "refunded") return false;
  if (current === "paid") return next === "refunded";
  if (["expired", "cancelled"].includes(current)) return false;
  return true;
}
