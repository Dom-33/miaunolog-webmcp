import { Link } from "@tanstack/react-router";
import { SOUNDS } from "../lib/cat-data";
import { label, t } from "../lib/labels";

export function SunetePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-sage">Catalog</p>
        <h1 className="font-display mt-1 text-3xl font-semibold">Sunete</h1>
        <p className="mt-2 text-ink-muted">
          16 tipuri de vocalizare, descrise textual.{" "}
          {t("syntheticRemoved")} Pentru vocea pisicii tale, folosește{" "}
          <Link to="/asculta" className="text-sage underline">
            Ascultă
          </Link>{" "}
          (înregistrare sau încărcare fișier).
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {SOUNDS.map((s) => (
          <div
            key={s.id}
            className="flex flex-col rounded-2xl border border-line bg-paper-2/30 p-4"
          >
            <h2 className="font-display text-lg text-ink">{label.sound(s.id)}</h2>
            <p className="text-xs text-ink-muted">{s.phonetic}</p>
            <p className="mt-2 flex-1 text-sm text-ink-muted">{s.summary}</p>
            <Link
              to="/sunete/$id"
              params={{ id: s.id }}
              className="mt-3 text-sm font-medium text-sage no-underline hover:underline"
            >
              Fișă completă →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
