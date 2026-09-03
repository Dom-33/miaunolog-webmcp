import { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { label } from "../lib/labels";
import { getProfile, listJournal, listProfiles } from "../lib/storage";

export function JurnalPage() {
  const search = useSearch({ from: "/jurnal" }) as { profile?: string };
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick((t) => t + 1);
    window.addEventListener("miaunolog-journal-change", refresh);
    return () => window.removeEventListener("miaunolog-journal-change", refresh);
  }, []);
  const profiles = useMemo(() => listProfiles(), [tick]);
  const entries = useMemo(() => {
    void tick;
    let all = listJournal();
    if (search.profile) all = all.filter((e) => e.profileId === search.profile);
    return all;
  }, [search.profile, tick]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-sage">Observații</p>
          <h1 className="font-display mt-1 text-3xl font-semibold">Jurnal</h1>
        </div>
        <Link
          to="/"
          className="rounded-xl bg-sage px-4 py-2 text-sm font-semibold text-paper no-underline"
        >
          Decoder nou
        </Link>
      </div>

      {profiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            to="/jurnal"
            className={`rounded-full border px-3 py-1 text-xs no-underline ${
              !search.profile ? "border-sage bg-sage text-paper" : "border-line text-ink-muted"
            }`}
          >
            Toate
          </Link>
          {profiles.map((p) => (
            <Link
              key={p.id}
              to="/jurnal"
              search={{ profile: p.id }}
              className={`rounded-full border px-3 py-1 text-xs no-underline ${
                search.profile === p.id
                  ? "border-sage bg-sage text-paper"
                  : "border-line text-ink-muted"
              }`}
            >
              {p.name}
            </Link>
          ))}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-12 text-center text-ink-muted">
          Nicio observație încă. Rulează decoderul și salvează rezultatul.
        </div>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => {
            const p = getProfile(e.profileId);
            return (
              <li key={e.id} className="rounded-2xl border border-line bg-paper-2/30 p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                  <time>{new Date(e.createdAt).toLocaleString("ro-RO")}</time>
                  <span>·</span>
                  <span>{p?.name ?? "Fără profil"}</span>
                  <span>·</span>
                  <span>{label.sound(String(e.input.soundId))}</span>
                </div>
                <h2 className="mt-2 font-display text-lg text-ink">{e.result.headline}</h2>
                <p className="mt-1 text-sm text-sage">„{e.result.catVoice}”</p>
                <div className="mt-2 flex gap-2 text-xs">
                  <span className="rounded-full bg-sage/10 px-2 py-0.5 text-sage">
                    {label.mood(String(e.result.mood))}
                  </span>
                  <span className="rounded-full bg-paper px-2 py-0.5 text-ink-muted">
                    {label.intensity(String(e.result.intensity))}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <button type="button" className="hidden" onClick={() => setTick((t) => t + 1)} />
    </div>
  );
}
