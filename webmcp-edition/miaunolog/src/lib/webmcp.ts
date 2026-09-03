import { decode, hasDefensiveBody } from "./decoder";
import {
  addJournalEntry,
  getActiveProfile,
  getProfile,
  listProfiles,
} from "./storage";
import type { CatProfile, DecodeInput, DecodeResult, JournalEntry } from "./types";
import { nowIso, uid } from "./types";

const SOUND_MAP = {
  meow: "miau",
  long_meow: "miau-lung",
  mew: "mew",
  purr: "purr",
  trill: "trill",
  chirp: "chirp",
  chatter: "chatter",
  hiss: "hiss",
  spit: "spit",
  growl: "growl",
  yowl: "yowl",
  caterwaul: "caterwaul",
  shriek: "shriek",
  sigh: "sigh",
  gurgle: "gurgle",
  active_silence: "silent",
} as const;

const EARS_MAP = {
  forward: "ears-forward",
  sideways: "ears-side",
  back: "ears-back",
  flat: "ears-flat",
} as const;

const TAIL_MAP = {
  up: "tail-up",
  question_mark: "tail-question",
  swishing: "tail-swish",
  puffed: "tail-puff",
  tucked: "tail-tuck",
  wrapped: "tail-wrap",
} as const;

const EYES_MAP = {
  soft: "eyes-soft",
  dilated: "eyes-dilated",
  constricted: "eyes-constricted",
  fixed_stare: "eyes-stare",
} as const;

const POSTURE_MAP = {
  relaxed: "post-relaxed",
  loaf: "post-loaf",
  arched: "post-arch",
  crouched: "post-crouch",
  belly_up: "post-belly",
} as const;

const PLACE_MAP = {
  door: "door",
  window: "window",
  food_bowl: "bowl",
  bed: "bed",
  litter_box: "litter",
  near_person: "lap",
  other: "other",
} as const;

const MOMENT_MAP = {
  morning: "morning",
  day: "day",
  evening: "evening",
  night: "night",
} as const;

const MOOD_EN: Record<string, string> = {
  solicitare: "Request / solicitation",
  afectiune: "Affection",
  alerta: "Alert",
  frica: "Fear",
  agresivitate: "Defensive aggression",
  vanatoare: "Hunting focus",
  disconfort: "Discomfort",
  calm: "Calm",
  joaca: "Play",
  teritorial: "Territorial",
  durere: "Pain / distress",
};

const INTENSITY_EN: Record<string, string> = {
  scazuta: "Low",
  medie: "Medium",
  ridicata: "High",
};

const PROFILE_MODIFIER_EN: Record<string, string> = {
  "senior-nocturnal-yowl": "Senior profile increases the significance of night vocalization",
  "intact-caterwaul": "Intact profile supports a hormonal / mating interpretation",
  "kitten-mew": "Kitten profile affects meow / mew interpretation",
  "indoor-door-meow": "Indoor profile changes the likely meaning of meowing at a door",
  "medical-notes-hint": "Medical notes are present on the cat profile",
};

const BODY_LABELS = {
  ears: {
    forward: "forward",
    sideways: "sideways",
    back: "back",
    flat: "flat",
  },
  tail: {
    up: "up / vertical",
    question_mark: "question-mark curve",
    swishing: "swishing",
    puffed: "puffed",
    tucked: "tucked",
    wrapped: "wrapped",
  },
  eyes: {
    soft: "soft / slow blink",
    dilated: "dilated pupils",
    constricted: "constricted pupils",
    fixed_stare: "fixed stare",
  },
  posture: {
    relaxed: "relaxed",
    loaf: "loaf",
    arched: "arched",
    crouched: "crouched",
    belly_up: "belly up",
  },
} as const;

const PROFILE_SCHEMA_PROPERTIES = {
  profile_id: {
    type: "string",
    maxLength: 128,
    description: "Optional Miaunolog profile id. Omit to use the active cat profile.",
  },
  profile_name: {
    type: "string",
    maxLength: 80,
    description: "Optional exact cat name, case-insensitive. Omit to use the active cat profile.",
  },
} as const;

const OBSERVATION_SCHEMA_PROPERTIES = {
  sound: {
    type: "string",
    enum: Object.keys(SOUND_MAP),
    description: "Observed cat vocalization or active silence.",
  },
  ears: {
    type: "string",
    enum: Object.keys(EARS_MAP),
    description: "Observed ear position, if known.",
  },
  tail: {
    type: "string",
    enum: Object.keys(TAIL_MAP),
    description: "Observed tail position or movement, if known.",
  },
  eyes: {
    type: "string",
    enum: Object.keys(EYES_MAP),
    description: "Observed eye signal, if known.",
  },
  posture: {
    type: "string",
    enum: Object.keys(POSTURE_MAP),
    description: "Observed body posture, if known.",
  },
  place: {
    type: "string",
    enum: Object.keys(PLACE_MAP),
    description: "Where the behavior occurred, if known.",
  },
  moment: {
    type: "string",
    enum: Object.keys(MOMENT_MAP),
    description: "Time-of-day context, if known.",
  },
  ...PROFILE_SCHEMA_PROPERTIES,
} as const;

type ToolInput = Record<string, unknown>;

type AgentObservation = {
  sound: keyof typeof SOUND_MAP;
  ears?: keyof typeof EARS_MAP;
  tail?: keyof typeof TAIL_MAP;
  eyes?: keyof typeof EYES_MAP;
  posture?: keyof typeof POSTURE_MAP;
  place?: keyof typeof PLACE_MAP;
  moment?: keyof typeof MOMENT_MAP;
  profile_id?: string;
  profile_name?: string;
  notes?: string;
};

function asString(input: ToolInput, key: string): string | undefined {
  const value = input[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function enumValue<T extends Record<string, string>>(
  map: T,
  value: string | undefined,
  field: string,
): keyof T | undefined {
  if (value == null) return undefined;
  if (!Object.prototype.hasOwnProperty.call(map, value)) {
    throw new Error(`Unsupported ${field}: ${value}`);
  }
  return value as keyof T;
}

function parseObservation(input: ToolInput): AgentObservation {
  const soundRaw = asString(input, "sound");
  if (!soundRaw) throw new Error("sound is required");
  const sound = enumValue(SOUND_MAP, soundRaw, "sound");
  if (!sound) throw new Error("sound is required");

  return {
    sound,
    ears: enumValue(EARS_MAP, asString(input, "ears"), "ears"),
    tail: enumValue(TAIL_MAP, asString(input, "tail"), "tail"),
    eyes: enumValue(EYES_MAP, asString(input, "eyes"), "eyes"),
    posture: enumValue(POSTURE_MAP, asString(input, "posture"), "posture"),
    place: enumValue(PLACE_MAP, asString(input, "place"), "place"),
    moment: enumValue(MOMENT_MAP, asString(input, "moment"), "moment"),
    profile_id: asString(input, "profile_id"),
    profile_name: asString(input, "profile_name"),
    notes: asString(input, "notes")?.slice(0, 500),
  };
}

function resolveProfile(input: { profile_id?: string; profile_name?: string }): CatProfile | null {
  if (input.profile_id) return getProfile(input.profile_id) ?? null;
  if (input.profile_name) {
    const wanted = input.profile_name.toLocaleLowerCase();
    return listProfiles().find((p) => p.name.toLocaleLowerCase() === wanted) ?? null;
  }
  return getActiveProfile();
}

function requireRequestedProfile(
  input: { profile_id?: string; profile_name?: string },
  profile: CatProfile | null,
) {
  if ((input.profile_id || input.profile_name) && !profile) {
    throw new Error("The requested cat profile was not found.");
  }
}

function toDecodeInput(input: AgentObservation): DecodeInput {
  return {
    soundId: SOUND_MAP[input.sound],
    ears: input.ears ? EARS_MAP[input.ears] : null,
    tail: input.tail ? TAIL_MAP[input.tail] : null,
    eyes: input.eyes ? EYES_MAP[input.eyes] : null,
    posture: input.posture ? POSTURE_MAP[input.posture] : null,
    place: input.place ? PLACE_MAP[input.place] : null,
    moment: input.moment ? MOMENT_MAP[input.moment] : null,
  };
}

export function publicProfile(profile: CatProfile) {
  return {
    id: profile.id,
    name: profile.name,
    age: profile.ageBand,
    sex: profile.sex ?? "unknown",
    neutered: profile.neutered,
    access: profile.access,
    medical_notes_present: Boolean(profile.medicalNotes.trim()),
  };
}

function observationEvidence(input: AgentObservation): string[] {
  const evidence = [`Sound: ${input.sound.replaceAll("_", " ")}`];
  if (input.ears) evidence.push(`Ears: ${BODY_LABELS.ears[input.ears]}`);
  if (input.tail) evidence.push(`Tail: ${BODY_LABELS.tail[input.tail]}`);
  if (input.eyes) evidence.push(`Eyes: ${BODY_LABELS.eyes[input.eyes]}`);
  if (input.posture) evidence.push(`Posture: ${BODY_LABELS.posture[input.posture]}`);
  if (input.place) evidence.push(`Place: ${input.place.replaceAll("_", " ")}`);
  if (input.moment) evidence.push(`Time: ${input.moment}`);
  return evidence;
}

export function presentInterpretation(
  input: AgentObservation,
  decodeInput: DecodeInput,
  result: DecodeResult,
  profile: CatProfile | null,
) {
  const defensive = hasDefensiveBody(decodeInput);
  const mood = MOOD_EN[String(result.mood)] ?? "Unclassified";
  const intensity = INTENSITY_EN[String(result.intensity)] ?? "Unclassified";
  const modifiers = (result.profileModifiersApplied ?? []).map(
    (id) => PROFILE_MODIFIER_EN[id] ?? "A profile-specific modifier was applied",
  );

  return {
    cat: profile ? publicProfile(profile) : null,
    interpretation: {
      mood,
      intensity,
      confidence: result.confidence,
      defensive_body_signal: defensive,
      summary: defensive
        ? `${intensity} ${mood.toLowerCase()} interpretation. Direct defensive body signals take priority over generic sound or profile cues.`
        : `${intensity} ${mood.toLowerCase()} interpretation based on the observed sound, body signals, context, and available cat profile.`,
      evidence: observationEvidence(input),
      profile_effects: modifiers,
    },
  };
}

export function getCatProfileHandler(input: ToolInput = {}) {
  const profileId = asString(input, "profile_id");
  const profileName = asString(input, "profile_name");
  const profile = resolveProfile({ profile_id: profileId, profile_name: profileName });
  requireRequestedProfile({ profile_id: profileId, profile_name: profileName }, profile);

  if (!profile) {
    return {
      found: false,
      message: "No active cat profile is available in Miaunolog.",
      available_profiles: listProfiles().map((p) => p.name),
    };
  }

  return { found: true, active: getActiveProfile()?.id === profile.id, profile: publicProfile(profile) };
}

export function interpretCatBehaviorHandler(input: ToolInput) {
  const observation = parseObservation(input);
  const profile = resolveProfile(observation);
  requireRequestedProfile(observation, profile);
  const decodeInput = toDecodeInput(observation);
  const result = decode(decodeInput, profile);
  return presentInterpretation(observation, decodeInput, result, profile);
}

export function addBehaviorObservationHandler(input: ToolInput) {
  const observation = parseObservation(input);
  const profile = resolveProfile(observation);
  requireRequestedProfile(observation, profile);
  if (!profile) {
    throw new Error("An active or explicitly selected cat profile is required to add a journal observation.");
  }

  const decodeInput = toDecodeInput(observation);
  const result = decode(decodeInput, profile);
  const entry: JournalEntry = {
    id: uid(),
    profileId: profile.id,
    createdAt: nowIso(),
    input: decodeInput,
    result,
    notes: observation.notes ?? "",
    audioRefs: [],
  };
  addJournalEntry(entry);

  return {
    saved: true,
    journal_entry_id: entry.id,
    created_at: entry.createdAt,
    ...presentInterpretation(observation, decodeInput, result, profile),
  };
}

export const WEBMCP_TOOLS = [
  {
    name: "get_cat_profile",
    title: "Get cat profile",
    description:
      "Read a Miaunolog cat profile from the current page session. Use the active profile when no id or name is provided. This tool does not modify application state.",
    inputSchema: {
      type: "object",
      properties: PROFILE_SCHEMA_PROPERTIES,
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: getCatProfileHandler,
  },
  {
    name: "interpret_cat_behavior",
    title: "Interpret cat behavior",
    description:
      "Run Miaunolog's existing rule-based decoder on an observed cat vocalization, body signals, context, and optional cat profile. Direct defensive body signals retain priority. This tool does not write to the journal.",
    inputSchema: {
      type: "object",
      required: ["sound"],
      properties: OBSERVATION_SCHEMA_PROPERTIES,
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: interpretCatBehaviorHandler,
  },
  {
    name: "add_behavior_observation",
    title: "Add behavior observation",
    description:
      "Decode one observed cat behavior with Miaunolog and save that exact interpretation to the active or selected cat's local journal. This modifies local application state only and does not send data over the network.",
    inputSchema: {
      type: "object",
      required: ["sound"],
      properties: {
        ...OBSERVATION_SCHEMA_PROPERTIES,
        notes: {
          type: "string",
          maxLength: 500,
          description: "Optional short note to store with the journal observation.",
        },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: addBehaviorObservationHandler,
  },
] satisfies MiaunologWebMcpTool[];

export async function registerWebMcpTools(): Promise<boolean> {
  const modelContext = document.modelContext;
  if (!modelContext) return false;

  // Safe for Vite HMR: abort old registrations before registering the current definitions.
  window.__miaunologWebMcpAbort?.abort();
  const controller = new AbortController();
  window.__miaunologWebMcpAbort = controller;

  try {
    await Promise.all(
      WEBMCP_TOOLS.map((tool) => modelContext.registerTool(tool, { signal: controller.signal })),
    );
    window.dispatchEvent(new Event("miaunolog-webmcp-ready"));
    return true;
  } catch (error) {
    console.error("[Miaunolog WebMCP] tool registration failed", error);
    window.dispatchEvent(new Event("miaunolog-webmcp-error"));
    return false;
  }
}
