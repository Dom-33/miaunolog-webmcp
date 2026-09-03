import { BODY_SIGNALS } from "../lib/cat-data";

export function CorpPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-sage">Atlas</p>
        <h1 className="font-display mt-1 text-3xl font-semibold">Limbaj corporal</h1>
        <p className="mt-2 max-w-xl text-ink-muted">
          Vocea e doar o parte. Urechile, coada, ochii și postura completează mesajul — și pot
          schimba complet interpretarea unui miau.
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
