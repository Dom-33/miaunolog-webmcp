/**
 * Strat centralizat de etichete UI.
 * Cheile interne (engleză) rămân stabile în logică/storage.
 * UI afișează doar texte din acest modul — nicio cheie brută către utilizator.
 *
 * Structură pregătită pentru RO + EN: schimbă `locale` și folosește același API.
 */

export type Locale = "ro" | "en";

let currentLocale: Locale = "en";

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

type Dict = Record<string, string>;

const soundName: Record<Locale, Dict> = {
  ro: {
    miau: "Miau",
    "miau-lung": "Miau lung",
    silent: "Tăcere activă",
    purr: "Toarcere",
    trill: "Trill / chirrup",
    chirp: "Chirp",
    chatter: "Chatter",
    hiss: "Șuierat",
    spit: "Scuipat",
    growl: "Mormăit",
    yowl: "Yowl",
    caterwaul: "Caterwaul",
    mew: "Mew (pui)",
    shriek: "Țipăt",
    sigh: "Oftat",
    gurgle: "Gurgle",
  },
  en: {
    miau: "Meow",
    "miau-lung": "Long meow",
    silent: "Active silence",
    purr: "Purr",
    trill: "Trill / chirrup",
    chirp: "Chirp",
    chatter: "Chatter",
    hiss: "Hiss",
    spit: "Spit",
    growl: "Growl",
    yowl: "Yowl",
    caterwaul: "Caterwaul",
    mew: "Mew (kitten)",
    shriek: "Shriek",
    sigh: "Sigh",
    gurgle: "Gurgle",
  },
};

const place: Record<Locale, Dict> = {
  ro: {
    door: "Ușă",
    window: "Fereastră",
    bowl: "Bol / hrană",
    bed: "Pat / somn",
    litter: "Litieră",
    lap: "Lângă om",
    other: "Altele",
  },
  en: {
    door: "Door",
    window: "Window",
    bowl: "Bowl / food",
    bed: "Bed / sleep",
    litter: "Litter box",
    lap: "Near person",
    other: "Other",
  },
};

const moment: Record<Locale, Dict> = {
  ro: {
    morning: "Dimineață",
    day: "Zi",
    evening: "Seară",
    night: "Noapte",
  },
  en: {
    morning: "Morning",
    day: "Day",
    evening: "Evening",
    night: "Night",
  },
};

const ageBand: Record<Locale, Dict> = {
  ro: { kitten: "Pui", adult: "Adult", senior: "Senior" },
  en: { kitten: "Kitten", adult: "Adult", senior: "Senior" },
};

const access: Record<Locale, Dict> = {
  ro: {
    indoor: "Doar în casă",
    outdoor: "Iese afară",
    both: "În casă și afară",
  },
  en: {
    indoor: "Indoor only",
    outdoor: "Goes outdoors",
    both: "Indoor and outdoor",
  },
};

const sex: Record<Locale, Dict> = {
  ro: { female: "Femelă", male: "Mascul", unknown: "Necunoscut" },
  en: { female: "Female", male: "Male", unknown: "Unknown" },
};

const mood: Record<Locale, Dict> = {
  ro: {
    solicitare: "Solicitare",
    afectiune: "Afecțiune",
    alerta: "Alertă",
    frica: "Frică",
    agresivitate: "Agresivitate",
    vanatoare: "Vânătoare",
    disconfort: "Disconfort",
    calm: "Calm",
    joaca: "Joacă",
    teritorial: "Teritorial",
    durere: "Durere",
  },
  en: {
    solicitare: "Request",
    afectiune: "Affection",
    alerta: "Alert",
    frica: "Fear",
    agresivitate: "Aggression",
    vanatoare: "Hunting",
    disconfort: "Discomfort",
    calm: "Calm",
    joaca: "Play",
    teritorial: "Territorial",
    durere: "Pain",
  },
};

const intensity: Record<Locale, Dict> = {
  ro: { scazuta: "Scăzută", medie: "Medie", ridicata: "Ridicată" },
  en: { scazuta: "Low", medie: "Medium", ridicata: "High" },
};

/** Modificatori tehnici → text uman (fără ID-uri) */
const profileModifier: Record<Locale, Dict> = {
  ro: {
    "senior-nocturnal-yowl": "Profil: senior, vocal nocturn",
    "intact-caterwaul": "Profil: necastrat(ă), semnal hormonal",
    "kitten-mew": "Profil: pui",
    "indoor-door-meow": "Profil: doar în casă, la ușă",
    "medical-notes-hint": "Profil: note medicale pe fișă",
  },
  en: {
    "senior-nocturnal-yowl": "Profile: senior, night vocalization",
    "intact-caterwaul": "Profile: intact, hormonal signal",
    "kitten-mew": "Profile: kitten",
    "indoor-door-meow": "Profile: indoor, at door",
    "medical-notes-hint": "Profile: medical notes on file",
  },
};

const bodyZone: Record<Locale, Dict> = {
  ro: {
    "ears-forward": "Înainte",
    "ears-side": "Lateral",
    "ears-back": "Pe spate",
    "ears-flat": "Lipite",
    "tail-up": "Sus, vertical",
    "tail-question": "Cârlig",
    "tail-swish": "Bâțâită",
    "tail-puff": "Zburlită",
    "tail-tuck": "Între picioare",
    "tail-wrap": "Înfășurată",
    "eyes-soft": "Moi / blink",
    "eyes-dilated": "Pupile dilatate",
    "eyes-constricted": "Pupile înguste",
    "eyes-stare": "Privire fixă",
    "post-relaxed": "Relaxată",
    "post-loaf": "Pâine",
    "post-arch": "Arcuită",
    "post-crouch": "Ghemuită",
    "post-belly": "Pe spate",
  },
  en: {
    "ears-forward": "Forward",
    "ears-side": "Sideways",
    "ears-back": "Back",
    "ears-flat": "Flat",
    "tail-up": "Up, vertical",
    "tail-question": "Question mark",
    "tail-swish": "Swishing",
    "tail-puff": "Puffed",
    "tail-tuck": "Tucked",
    "tail-wrap": "Wrapped",
    "eyes-soft": "Soft / slow blink",
    "eyes-dilated": "Dilated pupils",
    "eyes-constricted": "Constricted pupils",
    "eyes-stare": "Fixed stare",
    "post-relaxed": "Relaxed",
    "post-loaf": "Loaf",
    "post-arch": "Arched",
    "post-crouch": "Crouched",
    "post-belly": "Belly up",
  },
};

const MISSING = "—";

/**
 * Lookup sigur: niciodată nu returnează cheia tehnică brută în UI.
 * În development loghează label-urile lipsă.
 */
function lookup(table: Record<Locale, Dict>, key: string | null | undefined): string {
  if (key == null || key === "") return "";
  const loc = table[currentLocale] ?? table.ro;
  const found = loc[key] ?? table.ro[key];
  if (found != null && found !== "") return found;
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.warn(`[labels] missing label for internal key: ${JSON.stringify(key)}`);
  }
  return MISSING;
}

/** API central — garantat fără ID-uri tehnice în output. */
export function labelFor(
  domain:
    | "sound"
    | "place"
    | "moment"
    | "ageBand"
    | "access"
    | "sex"
    | "mood"
    | "intensity"
    | "body"
    | "profileModifier",
  key: string | null | undefined,
): string {
  return label[domain](key as string);
}

export const label = {
  sound: (id: string) => lookup(soundName, id),
  place: (id: string) => lookup(place, id),
  moment: (id: string) => lookup(moment, id),
  ageBand: (id: string) => lookup(ageBand, id),
  access: (id: string) => lookup(access, id),
  sex: (id: string) => lookup(sex, id),
  mood: (id: string) => lookup(mood, id),
  intensity: (id: string) => lookup(intensity, id),
  body: (id: string) => lookup(bodyZone, id),
  profileModifier: (id: string) => lookup(profileModifier, id),
  /** Listă modificatori → texte umane, fără ID-uri */
  profileModifiers: (ids: string[] | undefined) =>
    (ids ?? []).map((id) => lookup(profileModifier, id)).filter(Boolean),
};

export const ui = {
  ro: {
    noProfile: "Fără profil",
    active: "activ",
    neuteredYes: "sterilizat(ă)",
    neuteredNo: "necastrat(ă)",
    syntheticRemoved:
      "Exemplele audio din catalog vor folosi doar înregistrări reale cu licență clară. Deocamdată nu există sample verificat pentru această vocalizare.",
  },
  en: {
    noProfile: "No active profile",
    active: "active",
    neuteredYes: "neutered",
    neuteredNo: "intact",
    syntheticRemoved:
      "Catalog audio will use only real recordings with a clear license. No verified sample is available for this vocalization yet.",
  },
} as const;

export function t<K extends keyof typeof ui.ro>(key: K): string {
  return (ui[currentLocale] ?? ui.ro)[key];
}
