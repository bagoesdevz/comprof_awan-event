-- Seed data kanonis Awan Event: Tepat satu contoh event untuk evaluasi layout dan pengaturan.
-- Idempotent, tidak memuat data peserta dummy, akun fake, atau transaksi fiktif.

begin;

insert into public.platform_records (
  collection,
  id,
  data,
  owner_email,
  published,
  revision
)
values (
  'events',
  '00000000-0000-4000-8000-000000000001',
  '{
    "id": "00000000-0000-4000-8000-000000000001",
    "slug": "contoh-webinar-awan-event",
    "title": "Contoh Webinar Awan Event",
    "programType": "Webinar",
    "category": "Pengembangan Kompetensi",
    "type": "ONLINE",
    "startAt": "2026-12-15T09:00:00+07:00",
    "duration": "09.00–10.00 WIB",
    "city": "Online",
    "venue": "Online",
    "price": 0,
    "quotaLeft": 100,
    "credits": 0,
    "speaker": "",
    "registrationStatus": "COMING_SOON",
    "summary": "Contoh event untuk meninjau tampilan. Pendaftaran belum dibuka.",
    "description": "Contoh event untuk meninjau halaman dan pengaturan sebelum menerbitkan program pertama.",
    "audience": "Peserta Awan Event",
    "speakers": [],
    "learningOutcomes": [],
    "sessions": [],
    "tickets": [
      {
        "id": "gratis",
        "name": "Akses webinar",
        "attendance": "ONLINE",
        "price": 0,
        "pricingMode": "free",
        "quota": 100,
        "quotaLeft": 100,
        "benefits": [],
        "status": "active"
      }
    ],
    "detailRevision": 2,
    "lifecycle": "upcoming",
    "publication": "published",
    "endAt": "2026-12-15T03:00:00.000Z",
    "capacity": 100,
    "waitlist": true,
    "meetingProvider": "Zoom",
    "meetingUrl": "",
    "meetingId": "",
    "meetingPasscode": "",
    "accessOpensAt": "",
    "customFields": [],
    "blocks": [
      { "id": "block-0", "type": "Hero", "title": "Hero", "body": "", "visible": true },
      { "id": "block-1", "type": "Speaker", "title": "Speaker", "body": "", "visible": true },
      { "id": "block-2", "type": "About", "title": "About", "body": "", "visible": true },
      { "id": "block-3", "type": "Benefits", "title": "Benefits", "body": "", "visible": true },
      { "id": "block-4", "type": "Agenda", "title": "Agenda", "body": "", "visible": true },
      { "id": "block-5", "type": "Access", "title": "Access", "body": "", "visible": true },
      { "id": "block-6", "type": "Ticket", "title": "Ticket", "body": "", "visible": true },
      { "id": "block-7", "type": "Countdown", "title": "Countdown", "body": "", "visible": true },
      { "id": "block-8", "type": "FAQ", "title": "FAQ", "body": "", "visible": true },
      { "id": "block-9", "type": "CTA", "title": "CTA", "body": "", "visible": true }
    ],
    "preTest": {
      "enabled": false,
      "questions": [],
      "passingScore": 0,
      "attempts": 3,
      "timeLimit": 15
    },
    "postTest": {
      "enabled": false,
      "questions": [],
      "passingScore": 70,
      "attempts": 3,
      "timeLimit": 15
    },
    "certificateEnabled": false,
    "certificatePattern": "AWN-{year}-{sequence}",
    "certificateTemplate": "",
    "certificatePlacement": {
      "name": { "x": 50, "y": 47, "size": 42, "color": "#211052" },
      "number": { "x": 50, "y": 68, "size": 20, "color": "#5D607D" }
    },
    "reminder": "H-1 dan 2 jam sebelum event",
    "banner": ""
  }'::jsonb,
  null,
  true,
  1
)
on conflict (collection, id) do update
set
  data = excluded.data,
  published = excluded.published,
  owner_email = excluded.owner_email,
  updated_at = now();

commit;
