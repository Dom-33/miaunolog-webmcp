export type AgeBand = "kitten" | "adult" | "senior";
export type Access = "indoor" | "outdoor" | "both";
export type Sex = "female" | "male" | "unknown";

export type Mood =
  | "solicitare"
  | "afectiune"
  | "alerta"
  | "frica"
  | "agresivitate"
  | "vanatoare"
  | "disconfort"
  | "calm"
  | "joaca"
  | "teritorial"
  | "durere";

export type Intensity = "scazuta" | "medie" | "ridicata";

export type SoundId =
  | "miau"
  | "miau-lung"
  | "silent"
  | "purr"
  | "trill"
  | "chirp"
  | "chatter"
  | "hiss"
  | "spit"
  | "growl"
  | "yowl"
  | "caterwaul"
  | "mew"
  | "shriek"
  | "sigh"
  | "gurgle";

export type AudioSource = "catalog" | "user-record" | "user-upload";
export type CatalogLicense =
  | "CC0"
  | "CC-BY-4.0"
  | "CC-BY-SA-4.0"
  | "synthetic"
  | "owned";

export type AudioRef = {
  id: string;
  source: AudioSource;
  mimeType?: string;
  durationMs?: number;
  createdAt: string;
  label?: string;
  license?: CatalogLicense | null;
};

export type CatProfile = {
  id: string;
  name: string;
  ageBand: AgeBand;
  birthYear?: number | null;
  sex?: Sex | null;
  neutered?: boolean | null;
  access: Access;
  medicalNotes: string;
  avatarColor?: string;
  audioRefs: AudioRef[];
  createdAt: string;
  updatedAt: string;
};

export type DecodeInput = {
  soundId: SoundId | string;
  ears?: string | null;
  tail?: string | null;
  eyes?: string | null;
  posture?: string | null;
  whiskers?: string | null;
  place?: string | null;
  moment?: string | null;
};

export type DecodeResult = {
  headline: string;
  catVoice: string;
  mood: Mood | string;
  intensity: Intensity | string;
  confidence: number;
  explanation?: string;
  care?: string[];
  warnings?: string[];
  tags?: string[];
  profileModifiersApplied?: string[];
};

export type JournalEntry = {
  id: string;
  profileId: string;
  createdAt: string;
  input: DecodeInput;
  result: DecodeResult;
  notes: string;
  audioRefs: AudioRef[];
};

export type AppSettings = {
  locale: string;
  activeProfileId: string | null;
  decoderShowProfileChip: boolean;
};

export const STORAGE_KEYS = {
  profiles: "miaunolog.profiles.v1",
  activeProfileId: "miaunolog.activeProfileId.v1",
  journal: "miaunolog.journal.v1",
  settings: "miaunolog.settings.v1",
} as const;

export const MEDIA_DB = {
  dbName: "miaunolog-media",
  storeName: "clips",
  maxClipSeconds: 30,
} as const;

export function uid(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}
