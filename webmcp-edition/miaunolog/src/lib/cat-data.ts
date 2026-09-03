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
    name: "Miau",
    phonetic: "miau · mrrrau",
    summary: "Solicitare generală către om — hrană, atenție, ușă.",
    moods: ["solicitare"],
    meaning: "Vreau ceva de la tine. Urmărește contextul.",
    bodyHints: ["urechi înainte", "privește spre țintă"],
    care: ["Răspunde consistent; nu recompensa miaunatul excesiv la 3 noaptea fără motiv."],
    frequencyHint: "mediu, scurt",
  },
  {
    id: "miau-lung",
    name: "Miau lung",
    phonetic: "miaaau",
    summary: "Cerere intensă sau frustrare dacă e ignorată.",
    moods: ["solicitare", "disconfort"],
    meaning: "Insist. Nu am primit ce așteptam.",
    bodyHints: ["coadă agitata", "încearcă să te conducă"],
    care: ["Verifică nevoile de bază înainte de a ceda la insistentă goală."],
    frequencyHint: "mediu–jos, prelungit",
  },
  {
    id: "mew",
    name: "Mew (pui)",
    phonetic: "miu · mii",
    summary: "Sunet de pui — localizare, căldură, mamă.",
    moods: ["solicitare", "afectiune"],
    meaning: "Sunt mic / am nevoie de contact.",
    bodyHints: ["corp mic, mobil"],
    care: ["La pui: căldură, hrană, siguranță. La adult: poate semnala regresie sau stres."],
    frequencyHint: "înalt, scurt",
  },
  {
    id: "purr",
    name: "Toarcere",
    phonetic: "prrr · rrr",
    summary: "Conținut, vindecare, uneori și disconfort (purr de coping).",
    moods: ["calm", "afectiune", "disconfort"],
    meaning: "Sunt ok — sau mă liniștesc singură.",
    bodyHints: ["ochi închiși / blink lent", "corp relaxat"],
    care: ["Dacă toarce pe masa de operație sau rănită, e coping — nu înlocuiește îngrijirea."],
    frequencyHint: "jos, periodic ~20–30 Hz",
  },
  {
    id: "trill",
    name: "Trill / chirrup",
    phonetic: "brrp · prrt",
    summary: "Salut prietenos, invitație la urmărire.",
    moods: ["afectiune", "joaca"],
    meaning: "Salut. Vino cu mine.",
    bodyHints: ["coadă verticală", "urechi înainte"],
    care: ["Răspunde scurt; e un bun moment de interacțiune pozitivă."],
    frequencyHint: "mediu, ridicare scurtă",
  },
  {
    id: "chirp",
    name: "Chirp",
    phonetic: "ck-ck · chip",
    summary: "Excitație de vânătoare la fereastră / ecran.",
    moods: ["vanatoare", "alerta"],
    meaning: "Pradă! Atenție maximă.",
    bodyHints: ["privire fixă", "coadă bâțâită la vârf"],
    care: ["Oferă joc alternativ dacă frustrarea e mare."],
    frequencyHint: "înalt, staccato",
  },
  {
    id: "chatter",
    name: "Chatter",
    phonetic: "ka-ka-ka",
    summary: "Variantă intensă de chirp — frustrare de vânătoare.",
    moods: ["vanatoare", "alerta"],
    meaning: "Prada e aproape și nu pot ajunge.",
    bodyHints: ["maxilarul tremură", "corp coborât"],
    care: ["Normal la fereastră; redirecționează energia în joc."],
    frequencyHint: "rapid, dinți",
  },
  {
    id: "hiss",
    name: "Șuierat",
    phonetic: "ssss",
    summary: "Avertisment clar: distanță.",
    moods: ["frica", "agresivitate", "alerta"],
    meaning: "Nu te apropia.",
    bodyHints: ["urechi pe spate", "blană zburlită", "arc"],
    care: ["Oprește apropierea. Nu pedepsi — crește frica."],
    frequencyHint: "zgomot de aer",
  },
  {
    id: "spit",
    name: "Scuipat",
    phonetic: "pfft!",
    summary: "Escaladare bruscă după hiss.",
    moods: ["frica", "agresivitate"],
    meaning: "Ultimul avertisment.",
    bodyHints: ["săritură înapoi", "pupile dilatate"],
    care: ["Retragere totală. Evaluează cauza (dureri, oaspete, alt animal)."],
    frequencyHint: "exploziv, scurt",
  },
  {
    id: "growl",
    name: "Mormăit",
    phonetic: "grrr",
    summary: "Amenințare susținută, adesea pe resursă sau durere.",
    moods: ["agresivitate", "teritorial", "durere"],
    meaning: "E al meu / doare / stai departe.",
    bodyHints: ["corp rigid", "urechi laterale"],
    care: ["Nu forța. Dacă e nou, consult veterinar (durere)."],
    frequencyHint: "jos, continuu",
  },
  {
    id: "yowl",
    name: "Yowl",
    phonetic: "yooowl · aaoow",
    summary: "Disconfort, confuzie, chemare intensă — greu de ignorat.",
    moods: ["disconfort", "solicitare", "durere"],
    meaning: "Ceva e în neregulă sau am nevoie urgentă.",
    bodyHints: ["se plimbă", "privește gol"],
    care: ["La senior / nocturn: notează și discută cu veterinarul."],
    frequencyHint: "lung, variabil",
  },
  {
    id: "caterwaul",
    name: "Caterwaul",
    phonetic: "wao-wao-waoo",
    summary: "Chemare de împerechere / neliniște hormonală.",
    moods: ["teritorial", "solicitare"],
    meaning: "Caut partener / sunt agitat hormonal.",
    bodyHints: ["neliniște", "iese afară insistent"],
    care: ["Castrare/sterilizare reduce drastic. Altfel: control acces."],
    frequencyHint: "foarte intens, ondulat",
  },
  {
    id: "shriek",
    name: "Țipăt",
    phonetic: "Aaa!",
    summary: "Durere acută, panică, conflict.",
    moods: ["durere", "frica"],
    meaning: "Durere sau spaimă maximă.",
    bodyHints: ["fugă", "apărare"],
    care: ["Verifică imediat răniri. Separă animalele care se luptă."],
    frequencyHint: "foarte înalt, scurt",
  },
  {
    id: "sigh",
    name: "Oftat",
    phonetic: "hff",
    summary: "Relaxare sau renunțare blândă.",
    moods: ["calm"],
    meaning: "Mă așez. E ok.",
    bodyHints: ["se întinde", "ochi moi"],
    care: ["Semn pozitiv de confort."],
    frequencyHint: "suflu scurt",
  },
  {
    id: "gurgle",
    name: "Gurgle",
    phonetic: "glug-prr",
    summary: "Sunet mixt, adesea de conținut la hrană sau contact.",
    moods: ["afectiune", "calm"],
    meaning: "Sunt mulțumită, aproape de tine.",
    bodyHints: ["aproape de om", "toarce ușor"],
    care: ["Întărește legătura fără supra-stimulare."],
    frequencyHint: "mediu-jos",
  },
  {
    id: "silent",
    name: "Tăcere activă",
    phonetic: "—",
    summary: "Comunică prin corp: priviri, poziție, coadă.",
    moods: ["calm", "alerta", "afectiune"],
    meaning: "Privesc / aștept / evaluez fără voce.",
    bodyHints: ["tot corpul contează"],
    care: ["Nu forța vocalizarea; citește postura."],
    frequencyHint: "fără vocal",
  },
];

export function getSound(id: string): CatSound | undefined {
  return SOUNDS.find((s) => s.id === id);
}

export const BODY_OPTIONS = {
  ears: [
    { id: "ears-forward", label: "Înainte" },
    { id: "ears-side", label: "Lateral" },
    { id: "ears-back", label: "Pe spate" },
    { id: "ears-flat", label: "Lipite" },
  ],
  tail: [
    { id: "tail-up", label: "Sus, vertical" },
    { id: "tail-question", label: "Cârlig" },
    { id: "tail-swish", label: "Bâțâită" },
    { id: "tail-puff", label: "Zburlită" },
    { id: "tail-tuck", label: "Între picioare" },
    { id: "tail-wrap", label: "Înfășurată" },
  ],
  eyes: [
    { id: "eyes-soft", label: "Moi / blink" },
    { id: "eyes-dilated", label: "Pupile dilatate" },
    { id: "eyes-constricted", label: "Pupile înguste" },
    { id: "eyes-stare", label: "Privire fixă" },
  ],
  posture: [
    { id: "post-relaxed", label: "Relaxată" },
    { id: "post-loaf", label: "Pâine" },
    { id: "post-arch", label: "Arcuită" },
    { id: "post-crouch", label: "Ghemuită" },
    { id: "post-belly", label: "Pe spate" },
  ],
};

export const CONTEXT_PLACE = [
  { id: "door", label: "Ușă" },
  { id: "window", label: "Fereastră" },
  { id: "bowl", label: "Bol / hrană" },
  { id: "bed", label: "Pat / somn" },
  { id: "litter", label: "Litieră" },
  { id: "lap", label: "Lângă om" },
  { id: "other", label: "Altele" },
];

export const CONTEXT_MOMENT = [
  { id: "morning", label: "Dimineață" },
  { id: "day", label: "Zi" },
  { id: "evening", label: "Seară" },
  { id: "night", label: "Noapte" },
];

export const BODY_SIGNALS = [
  {
    zone: "Urechi",
    items: [
      { title: "Înainte", text: "Interes, atenție pozitivă." },
      { title: "Lateral / rotative", text: "Evaluare, nesiguranță ușoară." },
      { title: "Pe spate / lipite", text: "Frică sau agresivitate defensivă." },
    ],
  },
  {
    zone: "Coadă",
    items: [
      { title: "Verticală", text: "Prietenie, încredere." },
      { title: "Bâțâită la vârf", text: "Excitație / vânătoare." },
      { title: "Zburlită", text: "Alarmă maximă." },
      { title: "Între picioare", text: "Frică, supunere." },
    ],
  },
  {
    zone: "Ochi",
    items: [
      { title: "Blink lent", text: "Încredere („sărut de pisică”)." },
      { title: "Pupile dilatate", text: "Excitație, frică sau lumină slabă." },
      { title: "Privire fixă", text: "Provocare sau focus de vânătoare." },
    ],
  },
  {
    zone: "Postură",
    items: [
      { title: "Pâine (loaf)", text: "Confort, dar gata de mișcare." },
      { title: "Arcuită", text: "Amenințare / frică." },
      { title: "Pe spate", text: "Încredere sau, rar, apărare cu gheare." },
    ],
  },
];
