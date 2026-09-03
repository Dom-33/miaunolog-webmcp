import { Link, useParams } from "@tanstack/react-router";
import { getSound } from "../lib/cat-data";
import { label, t } from "../lib/labels";

export function SuneteDetailPage() {
  const { id } = useParams({ from: "/sunete/$id" });
  const s = getSound(id);

  if (!s) {
    return (
      <div className="py-12 text-center">
        <p className="text-ink-muted">Unknown sound.</p>
        <Link to="/sunete" className="mt-2 inline-block text-sage">
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to="/sunete" className="text-sm text-sage no-underline hover:underline">
        ← Catalog
      </Link>
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">{label.sound(s.id)}</h1>
        <p className="mt-1 text-ink-muted">
          {s.phonetic} · {s.frequencyHint}
        </p>
      </div>
      <p className="rounded-lg border border-line bg-paper-2/50 px-3 py-2 text-xs text-ink-muted">
        {t("syntheticRemoved")}
      </p>
      <section className="rounded-2xl border border-line p-4">
        <h2 className="text-sm font-semibold">Meaning</h2>
        <p className="mt-2 text-ink">{s.meaning}</p>
        <p className="mt-2 text-sm text-ink-muted">{s.summary}</p>
      </section>
      <section className="rounded-2xl border border-line p-4">
        <h2 className="text-sm font-semibold">Body cues (catalog)</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Guidance only. In the decoder, your body selections take priority.
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm text-ink-muted">
          {s.bodyHints.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl border border-line p-4">
        <h2 className="text-sm font-semibold">Care / response</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-ink-muted">
          {s.care.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>
      <Link
        to="/"
        search={{ sunet: s.id } as { sunet?: string; profile?: string }}
        className="inline-flex rounded-xl bg-sage px-5 py-2.5 text-sm font-semibold text-paper no-underline"
      >
        Use in decoder
      </Link>
    </div>
  );
}
