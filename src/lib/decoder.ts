import { BODY_OPTIONS, getSound } from "./cat-data";
import { label } from "./labels";
import type { CatProfile, DecodeInput, DecodeResult, Intensity } from "./types";

/** Semnale corporale de risc / defensive — observație directă, prioritate maximă. */
const DEFENSIVE = {
  ears: new Set(["ears-back", "ears-flat"]),
  tail: new Set(["tail-puff", "tail-tuck"]),
  posture: new Set(["post-arch", "post-crouch"]),
} as const;

export function hasDefensiveBody(input: DecodeInput): boolean {
  if (input.ears && DEFENSIVE.ears.has(input.ears)) return true;
  if (input.tail && DEFENSIVE.tail.has(input.tail)) return true;
  if (input.posture && DEFENSIVE.posture.has(input.posture)) return true;
  return false;
}

function labelFor(
  zone: "ears" | "tail" | "eyes" | "posture",
  id: string | null | undefined,
): string | null {
  if (!id) return null;
  const list = BODY_OPTIONS[zone];
  return list.find((o) => o.id === id)?.label ?? id;
}

/** Explicație din selecțiile reale — fără bodyHints generice din catalog. */
function buildExplanation(input: DecodeInput, soundName: string, phonetic: string): string {
  const parts: string[] = [`${soundName} (${phonetic})`];
  const observed: string[] = [];
  const ears = labelFor("ears", input.ears);
  const tail = labelFor("tail", input.tail);
  const eyes = labelFor("eyes", input.eyes);
  const posture = labelFor("posture", input.posture);
  if (ears) observed.push(`ears: ${ears.toLowerCase()}`);
  if (tail) observed.push(`tail: ${tail.toLowerCase()}`);
  if (eyes) observed.push(`eyes: ${eyes.toLowerCase()}`);
  if (posture) observed.push(`posture: ${posture.toLowerCase()}`);
  if (observed.length) {
    parts.push(`Observed: ${observed.join("; ")}.`);
  } else {
    parts.push(
      "No body signals selected — interpretation is based on vocalization and context.",
    );
  }
  if (input.place) parts.push(`Place: ${label.place(input.place)}.`);
  if (input.moment) parts.push(`Time: ${label.moment(input.moment)}.`);
  return parts.join(" ");
}

function baseFromSound(soundId: string, input: DecodeInput): DecodeResult {
  const s = getSound(soundId);
  if (!s) {
    return {
      headline: "Unknown sound",
      catVoice: "…",
      mood: "alerta",
      intensity: "medie",
      confidence: 0.3,
      explanation: "Choose a sound from the catalog.",
      care: [],
      warnings: [],
      tags: [],
      profileModifiersApplied: [],
    };
  }

  const intensity: Intensity = [
    "hiss",
    "spit",
    "shriek",
    "caterwaul",
    "yowl",
  ].includes(s.id)
    ? "ridicata"
    : ["miau-lung", "growl", "chatter"].includes(s.id)
      ? "medie"
      : "scazuta";

  return {
    headline: s.summary,
    catVoice: s.meaning,
    mood: s.moods[0] ?? "alerta",
    intensity,
    confidence: 0.72,
    explanation: buildExplanation(input, s.name, s.phonetic),
    care: [...s.care],
    warnings: [],
    tags: [s.id, ...s.moods],
    profileModifiersApplied: [],
  };
}

function applyBody(result: DecodeResult, input: DecodeInput): DecodeResult {
  const r = {
    ...result,
    care: [...(result.care ?? [])],
    warnings: [...(result.warnings ?? [])],
    tags: [...(result.tags ?? [])],
  };

  const defensive = hasDefensiveBody(input);

  if (input.ears === "ears-back" || input.ears === "ears-flat") {
    r.mood = "frica";
    r.intensity = "ridicata";
    r.confidence = Math.min(1, r.confidence + 0.1);
    r.headline = "Defensive signal — ears back / flat";
    r.catVoice = "Do not come closer. I need space.";
    r.warnings!.push("Ears back or flat — give them space.");
    r.tags!.push("urechi-defensive", "risc-corporal");
  }

  if (input.tail === "tail-puff") {
    r.mood = defensive && r.mood === "frica" ? "frica" : "alerta";
    r.intensity = "ridicata";
    r.confidence = Math.min(1, r.confidence + 0.08);
    if (!r.tags!.includes("risc-corporal")) {
      r.headline = "Alarm — puffed tail";
      r.catVoice = "I am on maximum alert.";
    }
    r.warnings!.push("Puffed tail — alarm state.");
    r.tags!.push("coada-alarma", "risc-corporal");
  }

  if (input.tail === "tail-tuck") {
    r.mood = "frica";
    r.intensity = "ridicata";
    r.headline = "Fear — tucked tail";
    r.catVoice = "I feel unsafe. Do not force contact.";
    r.warnings!.push("Tail between legs — fear or submission.");
    r.tags!.push("coada-frica", "risc-corporal");
  }

  if (input.posture === "post-arch") {
    r.mood = "frica";
    r.intensity = "ridicata";
    r.headline = "Threat / fear posture";
    r.catVoice = "Stay away.";
    r.warnings!.push("Arched body — do not approach.");
    r.tags!.push("postura-defensiva", "risc-corporal");
  }

  if (input.posture === "post-crouch") {
    r.mood = r.mood === "frica" ? "frica" : "alerta";
    r.intensity = r.intensity === "ridicata" ? "ridicata" : "medie";
    r.tags!.push("postura-ghemuita");
    if (defensive) {
      r.warnings!.push("Crouched posture — tension.");
    }
  }

  if (!defensive && input.eyes === "eyes-soft") {
    if (r.mood === "calm" || r.mood === "afectiune" || input.soundId === "purr") {
      r.mood = "afectiune";
      r.catVoice = "I am okay next to you.";
      r.confidence = Math.min(1, r.confidence + 0.05);
      r.tags!.push("ochi-moi");
    }
  }

  if (input.ears === "ears-forward" && !defensive) {
    r.tags!.push("urechi-interes");
  }

  const s = getSound(String(input.soundId));
  if (s) {
    r.explanation = buildExplanation(input, s.name, s.phonetic);
    if (defensive) {
      r.explanation +=
        " Defensive body signals take priority over generic catalog hints.";
    }
  }

  return r;
}

function applyContext(result: DecodeResult, input: DecodeInput): DecodeResult {
  const defensive = hasDefensiveBody(input);
  const r = {
    ...result,
    tags: [...(result.tags ?? [])],
    care: [...(result.care ?? [])],
  };

  if (defensive) {
    if (input.moment === "night") r.tags!.push("nocturn");
    if (input.place) r.tags!.push(`loc-${input.place}`);
    return r;
  }

  if (input.place === "bowl" && (input.soundId === "miau" || input.soundId === "miau-lung")) {
    r.headline = "Food-related request";
    r.catVoice = "I want food (or the feeding ritual).";
    r.mood = "solicitare";
    r.tags!.push("hrana");
  }
  if (input.place === "door" && (input.soundId === "miau" || input.soundId === "miau-lung")) {
    r.headline = "Access request";
    r.catVoice = "Open up — I want through.";
    r.tags!.push("usa");
  }
  if (input.place === "window" && (input.soundId === "chirp" || input.soundId === "chatter")) {
    r.headline = "Hunting at the window";
    r.mood = "vanatoare";
  }
  if (input.moment === "night") {
    r.tags!.push("nocturn");
  }
  return r;
}

function applyProfile(
  result: DecodeResult,
  input: DecodeInput,
  profile: CatProfile | null,
): DecodeResult {
  if (!profile) return result;

  const defensive = hasDefensiveBody(input);
  const r = {
    ...result,
    care: [...(result.care ?? [])],
    warnings: [...(result.warnings ?? [])],
    tags: [...(result.tags ?? [])],
    profileModifiersApplied: [...(result.profileModifiersApplied ?? [])],
  };
  const mods = r.profileModifiersApplied!;

  if (
    profile.ageBand === "senior" &&
    (input.soundId === "yowl" || input.soundId === "miau-lung") &&
    input.moment === "night"
  ) {
    mods.push("senior-nocturnal-yowl");
    r.tags!.push("senior");
    r.care!.push("Note when it started and how long it lasts");
    r.care!.push("See a vet if it is new or intensifying");
    r.warnings!.push("Do not shut them away as punishment for noise");
    if (!defensive) {
      r.headline = "Night voice in a senior — check, do not ignore";
      r.catVoice = "I am far from okay. Someone please hear me.";
      r.mood = "disconfort";
      r.intensity = "ridicata";
      r.confidence = Math.max(r.confidence, 0.86);
      r.explanation =
        (r.explanation ? r.explanation + " " : "") +
        "In a senior cat, nocturnal yowling weighs more toward pain, confusion, or metabolic disease than boredom.";
    } else {
      r.care!.push(
        "Senior profile: even with a defensive signal, nocturnal yowling is worth noting for the vet.",
      );
    }
  }

  if (profile.neutered === false && (input.soundId === "caterwaul" || input.soundId === "yowl")) {
    mods.push("intact-caterwaul");
    r.tags!.push("hormonal");
    r.care!.push("Neutering/spaying dramatically reduces this type of vocalization.");
    if (!defensive) {
      r.headline = "Hormonal signal / call";
      r.mood = "teritorial";
      r.intensity = "ridicata";
    }
  }

  if (profile.ageBand === "kitten" && (input.soundId === "mew" || input.soundId === "miau")) {
    mods.push("kitten-mew");
    r.tags!.push("pui");
    if (!defensive) {
      r.headline = "Kitten signal — contact and safety";
      r.catVoice = "I need warmth / someone nearby.";
      r.mood = "solicitare";
    } else {
      r.care!.push(
        "Kitten: fear can be intense — space and calm; do not force petting.",
      );
      r.explanation =
        (r.explanation ?? "") +
        " Kitten profile: do not interpret as a contact request while the body is defensive.";
    }
  }

  if (
    profile.access === "indoor" &&
    input.place === "door" &&
    (input.soundId === "miau" || input.soundId === "miau-lung")
  ) {
    mods.push("indoor-door-meow");
    if (!defensive) {
      r.headline = "Indoor access (not necessarily outdoors)";
      r.catVoice = "Open this door — I want into another area.";
      r.explanation =
        (r.explanation ? r.explanation + " " : "") +
        "The cat is indoor-only: meowing at the door often asks for a room, not the street.";
    }
  }

  if (
    profile.medicalNotes.trim() &&
    ["yowl", "shriek", "purr"].includes(String(input.soundId))
  ) {
    mods.push("medical-notes-hint");
    r.tags!.push("context-medical-notat");
    r.care!.push(
      "You noted medical context on the profile — correlate with symptoms; do not self-diagnose.",
    );
  }

  return r;
}

export function decode(input: DecodeInput, profile: CatProfile | null = null): DecodeResult {
  let r = baseFromSound(String(input.soundId), input);
  r = applyBody(r, input);
  r = applyContext(r, input);
  r = applyProfile(r, input, profile);

  if (hasDefensiveBody(input)) {
    if (r.mood !== "frica" && r.mood !== "alerta" && r.mood !== "agresivitate") {
      r.mood = "frica";
    }
    if (r.intensity === "scazuta") r.intensity = "medie";
    r.tags = (r.tags ?? []).filter((t) => t !== "ochi-moi");
  }

  r.confidence = Math.round(Math.min(1, r.confidence) * 100) / 100;
  return r;
}

export function moodLabel(m: string): string {
  const map: Record<string, string> = {
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
  };
  return map[m] ?? m;
}

export function intensityLabel(i: string): string {
  return i === "ridicata" ? "High" : i === "medie" ? "Medium" : "Low";
}
