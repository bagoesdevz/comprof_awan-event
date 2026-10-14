"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import type { Registration } from "@/lib/platform-model";

export function RegistrationGroupDialog({ registration, eventTitle, groupUrl, onContinue }: {
  registration: Registration;
  eventTitle: string;
  groupUrl: string;
  onContinue: () => void;
}) {
  const [open, setOpen] = useState(true);
  function continueRegistration() { setOpen(false); onContinue(); }
  return <div>
    <p role="status" className="flow-alert success">Pendaftaran Anda tersimpan.</p>
    <Dialog.Root open={open} onOpenChange={value => { if (!value) continueRegistration(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="registration-group-overlay" />
        <Dialog.Content className="registration-group-dialog" onCloseAutoFocus={event => event.preventDefault()}>
          <div className="registration-group-icon"><MessageCircle size={28} aria-hidden="true" /></div>
          <Dialog.Title>Pendaftaran tersimpan</Dialog.Title>
          <p className="registration-group-event">{eventTitle}</p>
          <Dialog.Description className="registration-group-description">Gabung grup WhatsApp untuk menerima informasi dari penyelenggara tentang event ini.</Dialog.Description>
          {registration.payment !== "paid" && <p className="registration-group-payment">Pembayaran Anda belum selesai. Lanjutkan pembayaran untuk mengonfirmasi tiket.</p>}
          <div className="registration-group-actions">
            <a href={groupUrl} target="_blank" rel="noopener noreferrer" className="flow-button">Gabung grup WhatsApp</a>
            <button type="button" onClick={continueRegistration} className="flow-button secondary">{registration.payment === "paid" ? "Buka event saya" : "Lanjutkan pembayaran"}</button>
          </div>
          <p className="registration-group-note">WhatsApp dibuka di tab baru. Anda bisa bergabung nanti.</p>
          <button type="button" onClick={continueRegistration} className="registration-group-close" aria-label="Tutup dan lanjutkan"><X size={20} aria-hidden="true" /></button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </div>;
}
