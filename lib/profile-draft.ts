import { blankProfile, type Profile } from "./platform-model";

export function mergeProfileDraft(email: string, saved?: Partial<Profile>, draft?: Profile, edited: ReadonlySet<keyof Profile> = new Set()) {
  const next = { ...blankProfile(email), ...saved, email };
  if (draft?.email === email) {
    for (const key of edited) if (key !== "email") next[key] = draft[key];
  }
  return next;
}
