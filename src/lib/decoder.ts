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
  if (ears) observed.push(`urechi: ${ears.toLowerCase()}`);
  if (tail) observed.push(`coadă: ${tail.toLowerCase()}`);
  if (eyes) observed.push(`ochi: ${eyes.toLowerCase()}`);
  if (posture) observed.push(`postură: ${posture.toLowerCase()}`);
  if (observed.length) {
    parts.push(`Observat: ${observed.join("; ")}.`);
  } else {
    parts.push(
      "Fără semnale corporale selectate — interpretarea se bazează pe vocalizare și context.",
    );
  }
  if (input.place) parts.push(`Loc: ${label.place(input.place)}.`);
  if (input.moment) parts.push(`Moment: ${label.moment(input.moment)}.`);
  return parts.join(" ");
}

function baseFromSound(soundId: string, input: DecodeInput): DecodeResult {
  const s = getSound(soundId);
  if (!s) {
    return {
      headline: "Sunet necunoscut",
      catVoice: "…",
      mood: "alerta",
      intensity: "medie",
      confidence: 0.3,
      explanation: "Alege un sunet din catalog.",
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
    r.headline = "Semnal defensiv — urechi pe spate / lipite";
    r.catVoice = "Nu te apropia. Am nevoie de distanță.";
    r.warnings!.push("Urechile pe spate sau lipite — dă-i spațiu.");
    r.tags!.push("urechi-defensive", "risc-corporal");
  }

  if (input.tail === "tail-puff") {
    r.mood = defensive && r.mood === "frica" ? "frica" : "alerta";
    r.intensity = "ridicata";
    r.confidence = Math.min(1, r.confidence + 0.08);
    if (!r.tags!.includes("risc-corporal")) {
      r.headline = "Alarmă — coadă zburlită";
      r.catVoice = "Sunt pe maxim de alertă.";
    }
    r.warnings!.push("Coadă zburlită — stare de alarmă.");
    r.tags!.push("coada-alarma", "risc-corporal");
  }

  if (input.tail === "tail-tuck") {
    r.mood = "frica";
    r.intensity = "ridicata";
    r.headline = "Frică — coadă retrasă";
    r.catVoice = "Mă simt nesigură. Nu forța contactul.";
    r.warnings!.push("Coadă între picioare — frică sau supunere.");
    r.tags!.push("coada-frica", "risc-corporal");
  }

  if (input.posture === "post-arch") {
    r.mood = "frica";
    r.intensity = "ridicata";
    r.headline = "Postură de amenințare / frică";
    r.catVoice = "Stai departe.";
    r.warnings!.push("Corp arcuit — nu te apropia.");
    r.tags!.push("postura-defensiva", "risc-corporal");
  }

  if (input.posture === "post-crouch") {
    r.mood = r.mood === "frica" ? "frica" : "alerta";
    r.intensity = r.intensity === "ridicata" ? "ridicata" : "medie";
    r.tags!.push("postura-ghemuita");
    if (defensive) {
      r.warnings!.push("Postură ghemuită — tensiune.");
    }
  }

  if (!defensive && input.eyes === "eyes-soft") {
    if (r.mood === "calm" || r.mood === "afectiune" || input.soundId === "purr") {
      r.mood = "afectiune";
      r.catVoice = "Sunt bine lângă tine.";
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
        " Semnalele corporale defensive au prioritate față de indiciile generice din catalog.";
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
    r.headline = "Cerere legată de hrană";
    r.catVoice = "Vreau mâncare (sau ritualul de hrană).";
    r.mood = "solicitare";
    r.tags!.push("hrana");
  }
  if (input.place === "door" && (input.soundId === "miau" || input.soundId === "miau-lung")) {
    r.headline = "Cerere de acces";
    r.catVoice = "Deschide — vreau dincolo.";
    r.tags!.push("usa");
  }
  if (input.place === "window" && (input.soundId === "chirp" || input.soundId === "chatter")) {
    r.headline = "Vânătoare la fereastră";
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
    r.care!.push("Notează de când a început și cât durează");
    r.care!.push("Programare veterinar dacă e nou sau se intensifică");
    r.warnings!.push("Nu o închide ca pedeapsă pentru zgomot");
    if (!defensive) {
      r.headline = "Voce de noapte la senior — verifică, nu ignora";
      r.catVoice = "Sunt departe de bine. Cineva să audă.";
      r.mood = "disconfort";
      r.intensity = "ridicata";
      r.confidence = Math.max(r.confidence, 0.86);
      r.explanation =
        (r.explanation ? r.explanation + " " : "") +
        "La o pisică senior, yowl-ul nocturn cântărește mai greu spre durere, confuzie sau boală metabolică decât spre plictiseală.";
    } else {
      r.care!.push(
        "Profil senior: chiar și cu semnal defensiv, yowl-ul nocturn merită notat pentru veterinar.",
      );
    }
  }

  if (profile.neutered === false && (input.soundId === "caterwaul" || input.soundId === "yowl")) {
    mods.push("intact-caterwaul");
    r.tags!.push("hormonal");
    r.care!.push("Sterilizarea/castrarea reduce dramatic acest tip de vocalizare.");
    if (!defensive) {
      r.headline = "Semnal hormonal / chemare";
      r.mood = "teritorial";
      r.intensity = "ridicata";
    }
  }

  if (profile.ageBand === "kitten" && (input.soundId === "mew" || input.soundId === "miau")) {
    mods.push("kitten-mew");
    r.tags!.push("pui");
    if (!defensive) {
      r.headline = "Semnal de pui — contact și siguranță";
      r.catVoice = "Am nevoie de căldură / pe cineva aproape.";
      r.mood = "solicitare";
    } else {
      r.care!.push(
        "E pui: frica poate fi intensă — spațiu și calm, nu forța mângâierea.",
      );
      r.explanation =
        (r.explanation ?? "") +
        " Profil pui: nu interpretăm ca cerere de contact cât timp corpul e defensiv.";
    }
  }

  if (
    profile.access === "indoor" &&
    input.place === "door" &&
    (input.soundId === "miau" || input.soundId === "miau-lung")
  ) {
    mods.push("indoor-door-meow");
    if (!defensive) {
      r.headline = "Acces în casă (nu neapărat afară)";
      r.catVoice = "Deschide ușa asta — vreau în altă zonă.";
      r.explanation =
        (r.explanation ? r.explanation + " " : "") +
        "Pisica e ținută indoor: miaunatul la ușă cere adesea o cameră, nu strada.";
    }
  }

  if (
    profile.medicalNotes.trim() &&
    ["yowl", "shriek", "purr"].includes(String(input.soundId))
  ) {
    mods.push("medical-notes-hint");
    r.tags!.push("context-medical-notat");
    r.care!.push(
      "Ai notat context medical pe profil — corelează cu simptomele, fără a diagnostica singur.",
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
  };
  return map[m] ?? m;
}

export function intensityLabel(i: string): string {
  return i === "ridicata" ? "Ridicată" : i === "medie" ? "Medie" : "Scăzută";
}
