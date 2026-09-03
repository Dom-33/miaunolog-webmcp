import { BODY_SIGNALS } from "../lib/cat-data";

export function CorpPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-sage">Atlas</p>
        <h1 className="font-display mt-1 text-3xl font-semibold">Body language</h1>
        <p className="mt-2 max-w-xl text-ink-muted">
          Voice is only part of it. Ears, tail, eyes, and posture complete the message — and can
          completely change how a meow is read.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {BODY_SIGNALS.map((zone) => (
          <section key={zone.zone} className="rounded-2xl border border-line bg-paper-2/30 p-4">
            <h2 className="font-display text-xl text-sage">{zone.zone}</h2>
            <ul className="mt-3 space-y-3">
              {zone.items.map((item) => (
                <li key={item.title}>
                  <div className="text-sm font-semibold text-ink">{item.title}</div>
                  <p className="text-sm text-ink-muted">{item.text}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
