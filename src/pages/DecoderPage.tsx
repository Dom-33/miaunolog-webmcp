import { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { BODY_OPTIONS, CONTEXT_MOMENT, CONTEXT_PLACE, SOUNDS } from "../lib/cat-data";
import { decode } from "../lib/decoder";
import { addJournalEntry, getActiveProfile, getProfile } from "../lib/storage";
import type { DecodeInput, DecodeResult } from "../lib/types";
import { nowIso, uid } from "../lib/types";
import { label } from "../lib/labels";

export function DecoderPage() {
  const search = useSearch({ from: "/" }) as { sunet?: string; profile?: string };
  const [soundId, setSoundId] = useState(search.sunet ?? "miau");
  const [ears, setEars] = useState<string | null>(null);
  const [tail, setTail] = useState<string | null>(null);
  const [eyes, setEyes] = useState<string | null>(null);
  const [posture, setPosture] = useState<string | null>(null);
  const [place, setPlace] = useState<string | null>(null);
  const [moment, setMoment] = useState<string | null>(null);
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [saved, setSaved] = useState(false);

  const profile = useMemo(() => {
    if (search.profile) return getProfile(search.profile) ?? getActiveProfile();
    return getActiveProfile();
  }, [search.profile, result]);

  useEffect(() => {
    if (search.sunet) setSoundId(search.sunet);
  }, [search.sunet]);

  function runDecode() {
    const input: DecodeInput = {
      soundId,
      ears,
      tail,
      eyes,
      posture,
      place,
      moment,
    };
    setResult(decode(input, profile));
    setSaved(false);
  }

  function saveToJournal() {
    if (!result) return;
    const profileId = profile?.id ?? "none";
    addJournalEntry({
      id: uid(),
      profileId,
      createdAt: nowIso(),
      input: { soundId, ears, tail, eyes, posture, place, moment },
      result,
      notes: "",
      audioRefs: [],
    });
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-sage">Decoder</p>
        <h1 className="font-display mt-1 text-3xl font-semibold text-ink">
          What is the cat saying?
        </h1>
        <p className="mt-2 max-w-xl text-ink-muted">
          Choose the sound, then fill in body and context.{" "}
          {profile ? (
            <>
              Reading as for <strong className="text-ink">{profile.name}</strong>
              {profile.ageBand !== "adult" ? ` (${label.ageBand(profile.ageBand).toLowerCase()})` : ""}.
            </>
          ) : (
            <>
              No active profile —{" "}
              <Link to="/pisici" className="text-sage underline">
                add a cat
              </Link>{" "}
              for personalized weighting.
            </>
          )}
        </p>
      </div>

      <section className="rounded-2xl border border-line bg-paper-2/40 p-4">
        <h2 className="text-sm font-semibold text-ink">1. Sound</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SOUNDS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSoundId(s.id)}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                soundId === s.id
                  ? "border-sage bg-sage text-paper"
                  : "border-line bg-paper hover:border-sage-light"
              }`}
            >
              <div className="font-medium">{label.sound(s.id)}</div>
              <div className={`text-xs ${soundId === s.id ? "text-paper/80" : "text-ink-muted"}`}>
                {s.phonetic}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-paper-2/40 p-4">
        <h2 className="text-sm font-semibold text-ink">2. Body (optional)</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {(
            [
              ["Ears", BODY_OPTIONS.ears, ears, setEars],
              ["Tail", BODY_OPTIONS.tail, tail, setTail],
              ["Eyes", BODY_OPTIONS.eyes, eyes, setEyes],
              ["Posture", BODY_OPTIONS.posture, posture, setPosture],
            ] as const
          ).map(([label, opts, value, set]) => (
            <div key={label}>
              <div className="mb-1.5 text-xs font-medium text-ink-muted">{label}</div>
              <div className="flex flex-wrap gap-1.5">
                {opts.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => set(value === o.id ? null : o.id)}
                    className={`rounded-full border px-2.5 py-1 text-xs ${
                      value === o.id
                        ? "border-sage bg-sage text-paper"
                        : "border-line bg-paper text-ink-muted"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-paper-2/40 p-4">
        <h2 className="text-sm font-semibold text-ink">3. Context (optional)</h2>
        <div className="mt-3 flex flex-wrap gap-4">
          <div>
            <div className="mb-1.5 text-xs font-medium text-ink-muted">Place</div>
            <div className="flex flex-wrap gap-1.5">
              {CONTEXT_PLACE.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setPlace(place === o.id ? null : o.id)}
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    place === o.id
                      ? "border-sage bg-sage text-paper"
                      : "border-line bg-paper text-ink-muted"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-xs font-medium text-ink-muted">Time</div>
            <div className="flex flex-wrap gap-1.5">
              {CONTEXT_MOMENT.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setMoment(moment === o.id ? null : o.id)}
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    moment === o.id
                      ? "border-sage bg-sage text-paper"
                      : "border-line bg-paper text-ink-muted"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={runDecode}
        className="w-full rounded-xl bg-sage py-3 text-sm font-semibold text-paper hover:bg-sage-light sm:w-auto sm:px-8"
      >
        Interpret
      </button>

      {result && (
        <article className="rounded-2xl border border-sage/30 bg-paper p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-sage/10 px-2 py-0.5 text-sage">
              {label.mood(String(result.mood))}
            </span>
            <span className="rounded-full bg-paper-2 px-2 py-0.5 text-ink-muted">
              {label.intensity(String(result.intensity))}
            </span>
            <span className="text-ink-muted">
              confidence {(result.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <h2 className="font-display mt-3 text-2xl text-ink">{result.headline}</h2>
          <blockquote className="mt-3 border-l-2 border-sage pl-3 font-display text-lg text-sage">
            „{result.catVoice}”
          </blockquote>
          {result.explanation && (
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{result.explanation}</p>
          )}
          {result.profileModifiersApplied && result.profileModifiersApplied.length > 0 && (
            <p className="mt-2 text-xs text-sage">
              {label.profileModifiers(result.profileModifiersApplied).join(" · ")}
            </p>
          )}
          {result.care && result.care.length > 0 && (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ink">
              {result.care.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
          {result.warnings && result.warnings.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-clay">
              {result.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveToJournal}
              className="rounded-lg border border-line bg-paper-2 px-4 py-2 text-sm font-medium text-ink"
            >
              {saved ? "Saved to journal" : "Save to journal"}
            </button>
            <Link
              to="/jurnal"
              className="rounded-lg px-4 py-2 text-sm text-sage no-underline hover:underline"
            >
              View journal
            </Link>
          </div>
        </article>
      )}
    </div>
  );
}
