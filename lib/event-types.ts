export type EventType = "ONLINE" | "ONSITE" | "HYBRID";
export type RegistrationStatus = "OPEN" | "COMING_SOON" | "SOLD_OUT" | "CLOSED";

export type EventSummary = {
  programType?: string;
  id: string;
  slug: string;
  title: string;
  category: string;
  type: EventType;
  startAt: string;
  duration: string;
  city: string;
  venue: string;
  price: number;
  quotaLeft: number;
  credits: number;
  speaker: string;
  registrationStatus: RegistrationStatus;
  recurrence?: {
    label: string;
    nextDates: string[];
  };
};


export type EventSession = {
  time: string;
  title: string;
  note: string;
};

export type TicketOption = {
  id: string;
  name: string;
  attendance: "ONLINE" | "ONSITE";
  price: number;
  quota: number;
  quotaLeft: number;
  benefits: string[];
  startsAt?: string;
  endsAt?: string;
  quantityLimit?: number;
  status?: "active" | "inactive";
  pricingMode?: "free" | "paid";
};

export type EventSpeaker = {
  photo?: string;
  name: string;
  role: string;
  organization: string;
  bio: string;
};

export type EventDetail = EventSummary & {
  summary: string;
  description: string;
  audience: string;
  speakers: EventSpeaker[];
  venueAddress?: string;
  mapLabel?: string;
  learningOutcomes: string[];
  sessions: EventSession[];
  tickets: TicketOption[];
};
