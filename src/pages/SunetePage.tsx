import { Link } from "@tanstack/react-router";
import { SOUNDS } from "../lib/cat-data";
import { label, t } from "../lib/labels";

export function SunetePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-sage">Catalog</p>
        <h1 className="font-display mt-1 text-3xl font-semibold">Sounds</h1>
        <p className="mt-2 text-ink-muted">
          16 vocalization types, described in text.{" "}
          {t("syntheticRemoved")} For your cat&apos;s real voice, use{" "}
          <Link to="/asculta" className="text-sage underline">
            Listen
          </Link>{" "}
          (record or upload a file).
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
              Full card →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
