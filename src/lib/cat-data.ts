import type { Mood, SoundId } from "./types";

export type CatSound = {
  id: SoundId;
  name: string;
  phonetic: string;
  summary: string;
  moods: Mood[];
  meaning: string;
  bodyHints: string[];
  care: string[];
  frequencyHint: string;
};

export const SOUNDS: CatSound[] = [
  {
    id: "miau",
    name: "Meow",
    phonetic: "miau · mrrrau",
    summary: "General request toward a person — food, attention, door.",
    moods: ["solicitare"],
    meaning: "I want something from you. Follow the context.",
    bodyHints: ["ears forward", "looking at the target"],
    care: ["Respond consistently; do not reward excessive meowing at 3 a.m. without reason."],
    frequencyHint: "mid, short",
  },
  {
    id: "miau-lung",
    name: "Long meow",
    phonetic: "miaaau",
    summary: "Intense request or frustration if ignored.",
    moods: ["solicitare", "disconfort"],
    meaning: "I insist. I did not get what I expected.",
    bodyHints: ["agitated tail", "trying to lead you"],
    care: ["Check basic needs before giving in to empty insistence."],
    frequencyHint: "mid–low, prolonged",
  },
  {
    id: "mew",
    name: "Mew (kitten)",
    phonetic: "miu · mii",
    summary: "Kitten sound — location, warmth, mother.",
    moods: ["solicitare", "afectiune"],
    meaning: "I am small / I need contact.",
    bodyHints: ["small, mobile body"],
    care: ["For kittens: warmth, food, safety. In adults: may signal regression or stress."],
    frequencyHint: "high, short",
  },
  {
    id: "purr",
    name: "Purr",
    phonetic: "prrr · rrr",
    summary: "Contentment, healing; sometimes discomfort (coping purr).",
    moods: ["calm", "afectiune", "disconfort"],
    meaning: "I am okay — or I am calming myself.",
    bodyHints: ["closed eyes / slow blink", "relaxed body"],
    care: ["If purring on an exam table or while injured, it is coping — it does not replace care."],
    frequencyHint: "low, periodic ~20–30 Hz",
  },
  {
    id: "trill",
    name: "Trill / chirrup",
    phonetic: "brrp · prrt",
    summary: "Friendly greeting, invitation to follow.",
    moods: ["afectiune", "joaca"],
    meaning: "Hello. Come with me.",
    bodyHints: ["vertical tail", "ears forward"],
    care: ["Respond briefly; a good moment for positive interaction."],
    frequencyHint: "mid, short rise",
  },
  {
    id: "chirp",
    name: "Chirp",
    phonetic: "ck-ck · chip",
    summary: "Hunting excitement at a window / screen.",
    moods: ["vanatoare", "alerta"],
    meaning: "Prey! Maximum attention.",
    bodyHints: ["fixed stare", "tip-of-tail twitch"],
    care: ["Offer alternative play if frustration is high."],
    frequencyHint: "high, staccato",
  },
  {
    id: "chatter",
    name: "Chatter",
    phonetic: "ka-ka-ka",
    summary: "Intense chirp variant — hunting frustration.",
    moods: ["vanatoare", "alerta"],
    meaning: "Prey is close and I cannot reach it.",
    bodyHints: ["jaw quivering", "lowered body"],
    care: ["Normal at the window; redirect energy into play."],
    frequencyHint: "rapid, teeth",
  },
  {
    id: "hiss",
    name: "Hiss",
    phonetic: "ssss",
    summary: "Clear warning: keep distance.",
    moods: ["frica", "agresivitate", "alerta"],
    meaning: "Do not come closer.",
    bodyHints: ["ears back", "puffed fur", "arch"],
    care: ["Stop approaching. Do not punish — it increases fear."],
    frequencyHint: "air noise",
  },
  {
    id: "spit",
    name: "Spit",
    phonetic: "pfft!",
    summary: "Sudden escalation after a hiss.",
    moods: ["frica", "agresivitate"],
    meaning: "Last warning.",
    bodyHints: ["jump back", "dilated pupils"],
    care: ["Full withdrawal. Assess cause (pain, visitor, other animal)."],
    frequencyHint: "explosive, short",
  },
  {
    id: "growl",
    name: "Growl",
    phonetic: "grrr",
    summary: "Sustained threat, often over a resource or pain.",
    moods: ["agresivitate", "teritorial", "durere"],
    meaning: "This is mine / it hurts / stay away.",
    bodyHints: ["rigid body", "sideways ears"],
    care: ["Do not force. If new, consult a vet (pain)."],
    frequencyHint: "low, continuous",
  },
  {
    id: "yowl",
    name: "Yowl",
    phonetic: "yooowl · aaoow",
    summary: "Discomfort, confusion, intense calling — hard to ignore.",
    moods: ["disconfort", "solicitare", "durere"],
    meaning: "Something is wrong or I need help urgently.",
    bodyHints: ["pacing", "blank stare"],
    care: ["In seniors / at night: note it and discuss with a vet."],
    frequencyHint: "long, variable",
  },
  {
    id: "caterwaul",
    name: "Caterwaul",
    phonetic: "wao-wao-waoo",
    summary: "Mating call / hormonal restlessness.",
    moods: ["teritorial", "solicitare"],
    meaning: "I am seeking a mate / I am hormonally agitated.",
    bodyHints: ["restlessness", "insistent outdoor access"],
    care: ["Neutering/spaying reduces this dramatically. Otherwise: control access."],
    frequencyHint: "very intense, undulating",
  },
  {
    id: "shriek",
    name: "Shriek",
    phonetic: "Aaa!",
    summary: "Acute pain, panic, conflict.",
    moods: ["durere", "frica"],
    meaning: "Pain or maximum fear.",
    bodyHints: ["fleeing", "defense"],
    care: ["Check for injuries immediately. Separate fighting animals."],
    frequencyHint: "very high, short",
  },
  {
    id: "sigh",
    name: "Sigh",
    phonetic: "hff",
    summary: "Relaxation or gentle resignation.",
    moods: ["calm"],
    meaning: "I am settling down. It is okay.",
    bodyHints: ["stretching", "soft eyes"],
    care: ["Positive sign of comfort."],
    frequencyHint: "short breath",
  },
  {
    id: "gurgle",
    name: "Gurgle",
    phonetic: "glug-prr",
    summary: "Mixed sound, often contentment around food or contact.",
    moods: ["afectiune", "calm"],
    meaning: "I am content, close to you.",
    bodyHints: ["near person", "soft purr"],
    care: ["Strengthen the bond without overstimulation."],
    frequencyHint: "mid–low",
  },
  {
    id: "silent",
    name: "Active silence",
    phonetic: "—",
    summary: "Communicates through the body: gaze, position, tail.",
    moods: ["calm", "alerta", "afectiune"],
    meaning: "I am watching / waiting / assessing without voice.",
    bodyHints: ["the whole body matters"],
    care: ["Do not force vocalization; read posture."],
    frequencyHint: "no vocal",
  },
];

export function getSound(id: string): CatSound | undefined {
  return SOUNDS.find((s) => s.id === id);
}

export const BODY_OPTIONS = {
  ears: [
    { id: "ears-forward", label: "Forward" },
    { id: "ears-side", label: "Sideways" },
    { id: "ears-back", label: "Back" },
    { id: "ears-flat", label: "Flat" },
  ],
  tail: [
    { id: "tail-up", label: "Up, vertical" },
    { id: "tail-question", label: "Question mark" },
    { id: "tail-swish", label: "Swishing" },
    { id: "tail-puff", label: "Puffed" },
    { id: "tail-tuck", label: "Tucked" },
    { id: "tail-wrap", label: "Wrapped" },
  ],
  eyes: [
    { id: "eyes-soft", label: "Soft / slow blink" },
    { id: "eyes-dilated", label: "Dilated pupils" },
    { id: "eyes-constricted", label: "Constricted pupils" },
    { id: "eyes-stare", label: "Fixed stare" },
  ],
  posture: [
    { id: "post-relaxed", label: "Relaxed" },
    { id: "post-loaf", label: "Loaf" },
    { id: "post-arch", label: "Arched" },
    { id: "post-crouch", label: "Crouched" },
    { id: "post-belly", label: "Belly up" },
  ],
};

export const CONTEXT_PLACE = [
  { id: "door", label: "Door" },
  { id: "window", label: "Window" },
  { id: "bowl", label: "Bowl / food" },
  { id: "bed", label: "Bed / sleep" },
  { id: "litter", label: "Litter box" },
  { id: "lap", label: "Near person" },
  { id: "other", label: "Other" },
];

export const CONTEXT_MOMENT = [
  { id: "morning", label: "Morning" },
  { id: "day", label: "Day" },
  { id: "evening", label: "Evening" },
  { id: "night", label: "Night" },
];

export const BODY_SIGNALS = [
  {
    zone: "Ears",
    items: [
      { title: "Forward", text: "Interest, positive attention." },
      { title: "Sideways / rotating", text: "Assessment, mild uncertainty." },
      { title: "Back / flat", text: "Fear or defensive aggression." },
    ],
  },
  {
    zone: "Tail",
    items: [
      { title: "Vertical", text: "Friendliness, confidence." },
      { title: "Tip twitching", text: "Excitement / hunting." },
      { title: "Puffed", text: "Maximum alarm." },
      { title: "Tucked", text: "Fear, submission." },
    ],
  },
  {
    zone: "Eyes",
    items: [
      { title: "Slow blink", text: "Trust (“cat kiss”)." },
      { title: "Dilated pupils", text: "Excitement, fear, or low light." },
      { title: "Fixed stare", text: "Challenge or hunting focus." },
    ],
  },
  {
    zone: "Posture",
    items: [
      { title: "Loaf", text: "Comfort, but ready to move." },
      { title: "Arched", text: "Threat / fear." },
      { title: "Belly up", text: "Trust or, rarely, claw defense." },
    ],
  },
];
