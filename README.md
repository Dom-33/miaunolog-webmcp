# Miaunolog

Aplicație pentru iubitorii de pisici — descifrarea limbajului vocal și corporal.

**Reconstrucție** pe baza designului și schemei de date din sesiunea de proiect (nu exportul bit-cu-bit din App Builder).

## Rulare

```bash
npm install
npm run dev
```

Deschide http://localhost:5173

## Corecții v1.3

- Ascultă: selector explicit dispozitiv + getUserMedia cu deviceId; track real afișat; nivel RMS; avertisment tăcere fără blocarea salvării.
- labels: fallback UI neutru (—), fără expunere ID intern; warning în DEV.

## Corecții v1.2

- Etichete UI centralizate (`src/lib/labels.ts`) — fără ID-uri interne în interfață; pregătit RO/EN.
- Catalog: fără tonuri sintetice ca „exemple” de vocalizare.
- Ascultă: înregistrare + **încărcare fișier**, listă dispozitive input, mesaje clare pentru microfon lipsă.
- package-lock regenerat pe https://registry.npmjs.org/

## Corecții v1.1

- Decoder: observațiile corporale defensive au prioritate; modificatorii de profil nu anulează semnalele de risc; explicația se construiește din selecții, fără bodyHints contradictorii.
- Audio catalog: `playSyntheticTone` reia AudioContext (Chrome suspended), envelope corect, etichetat clar ca ton sintetic orientativ (nu sample real).

## Funcții

- **Decoder** — sunet + corp + context → traducere (cu ponderi pe profil)
- **Sunete** — catalog 16 vocalizări
- **Corp** — atlas corporal
- **Ascultă** — înregistrare microfon → IndexedDB
- **Jurnal** — observații locale
- **Pisici** — profiluri nelimitate (localStorage)

Totul rămâne pe dispozitiv. Fără backend obligatoriu.

## Stack

Vite · React 19 · TanStack Router · Tailwind CSS 4 · TypeScript

## WebMCP Challenge Edition

The `/webmcp` route exposes the existing Miaunolog client-side state and decoder through three WebMCP tools:

- `get_cat_profile` — reads the active or selected cat profile.
- `interpret_cat_behavior` — runs the existing `decode()` logic without writing state.
- `add_behavior_observation` — runs the same decoder and writes the resulting observation to the existing local journal.

WebMCP registration lives in `src/lib/webmcp.ts` and uses `document.modelContext.registerTool(...)` when the browser exposes the experimental WebMCP API. In ordinary browsers the rest of Miaunolog still runs normally and the `/webmcp` page reports that WebMCP is unavailable.

For the challenge demo, create or activate a cat profile, open `/webmcp`, then ask a WebMCP-capable browser agent:

> Read my active cat profile. Interpret a meow with flat ears at the window at night. If the result is defensive, add that observation to the journal with the note “WebMCP demo”.

The journal UI listens for `miaunolog-journal-change`, so an agent write becomes visible without refreshing the page.
