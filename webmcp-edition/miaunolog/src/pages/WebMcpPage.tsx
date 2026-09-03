import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  getActiveProfile,
  listJournal,
  setActiveProfileId,
  upsertProfile,
} from "../lib/storage";
import type { Access, AgeBand, CatProfile } from "../lib/types";
import { nowIso, uid } from "../lib/types";
import { publicProfile, WEBMCP_TOOLS } from "../lib/webmcp";

const AGE_LABEL: Record<AgeBand, string> = {
  kitten: "Kitten",
  adult: "Adult",
  senior: "Senior",
};

const ACCESS_LABEL: Record<Access, string> = {
  indoor: "Indoor only",
  outdoor: "Outdoor",
  both: "Indoor + outdoor",
};

const MOOD_EN: Record<string, string> = {
  solicitare: "Request / solicitation",
  afectiune: "Affection",
  alerta: "Alert",
  frica: "Fear",
  agresivitate: "Defensive aggression",
  vanatoare: "Hunting focus",
  disconfort: "Discomfort",
  calm: "Calm",
  joaca: "Play",
  teritorial: "Territorial",
  durere: "Pain / distress",
};

export function WebMcpPage() {
  const [tick, setTick] = useState(0);
  const [name, setName] = useState("Milo");
  const [age, setAge] = useState<AgeBand>("adult");
  const [access, setAccess] = useState<Access>("indoor");
  const webMcpAvailable = typeof document !== "undefined" && Boolean(document.modelContext);
  const profile = useMemo(() => {
    void tick;
    return getActiveProfile();
  }, [tick]);
  const journal = useMemo(() => {
    void tick;
    return listJournal().slice(0, 5);
  }, [tick]);

  useEffect(() => {
    const refresh = () => setTick((value) => value + 1);
    window.addEventListener("miaunolog-journal-change", refresh);
    window.addEventListener("miaunolog-profile", refresh);
    window.addEventListener("miaunolog-webmcp-ready", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("miaunolog-journal-change", refresh);
      window.removeEventListener("miaunolog-profile", refresh);
      window.removeEventListener("miaunolog-webmcp-ready", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  function createProfile() {
    const now = nowIso();
    const p: CatProfile = {
      id: uid(),
      name: name.trim() || "Milo",
      ageBand: age,
      birthYear: null,
      sex: "unknown",
      neutered: null,
      access,
      medicalNotes: "",
      avatarColor: "#3E5248",
      audioRefs: [],
      createdAt: now,
      updatedAt: now,
    };
    upsertProfile(p);
    setActiveProfileId(p.id);
    window.dispatchEvent(new Event("miaunolog-profile"));
    setTick((value) => value + 1);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-sage/30 bg-paper p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">
              WebMCP Challenge Edition
            </p>
            <h1 className="font-display mt-2 text-4xl font-semibold text-ink">Miaunolog</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
              A shared cat-behavior workspace for people and browser agents. The agent reads the
              same local profile, runs the same decoder, and writes to the same journal as the
              human-facing app.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              webMcpAvailable ? "bg-sage/10 text-sage" : "bg-clay/10 text-clay"
            }`}
          >
            {webMcpAvailable ? "WebMCP available" : "WebMCP not exposed by this browser"}
          </span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {["Cat profile", "Behavior + context", "Interpretation", "Journal"].map((label, index) => (
          <div key={label} className="rounded-2xl border border-line bg-paper-2/40 p-4">
            <div className="text-xs font-semibold text-sage">0{index + 1}</div>
            <div className="mt-2 font-display text-lg text-ink">{label}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-paper p-5">
          <h2 className="font-display text-2xl text-ink">Active cat profile</h2>
          {profile ? (
            <div className="mt-4 space-y-2 text-sm">
              <div className="text-xl font-semibold text-ink">{profile.name}</div>
              <div className="text-ink-muted">
                {AGE_LABEL[profile.ageBand]} · {ACCESS_LABEL[profile.access]}
              </div>
              <div className="rounded-xl bg-paper-2 p-3 text-xs text-ink-muted">
                Agent-visible profile: {JSON.stringify(publicProfile(profile))}
              </div>
              <Link to="/pisici" className="inline-block text-sm text-sage no-underline hover:underline">
                Manage profiles in the full app →
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-ink-muted">
                Create a minimal local profile for the challenge demo. It uses the existing
                Miaunolog profile storage.
              </p>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm"
                aria-label="Cat name"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={age}
                  onChange={(event) => setAge(event.target.value as AgeBand)}
                  className="rounded-xl border border-line bg-paper px-3 py-2 text-sm"
                  aria-label="Cat age"
                >
                  <option value="kitten">Kitten</option>
                  <option value="adult">Adult</option>
                  <option value="senior">Senior</option>
                </select>
                <select
                  value={access}
                  onChange={(event) => setAccess(event.target.value as Access)}
                  className="rounded-xl border border-line bg-paper px-3 py-2 text-sm"
                  aria-label="Cat access"
                >
                  <option value="indoor">Indoor only</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="both">Indoor + outdoor</option>
                </select>
              </div>
              <button
                type="button"
                onClick={createProfile}
                className="rounded-xl bg-sage px-4 py-2.5 text-sm font-semibold text-paper"
              >
                Create and activate profile
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-paper p-5">
          <h2 className="font-display text-2xl text-ink">Try the agent workflow</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Ask the browser agent to use all three tools against the live page state.
          </p>
          <div className="mt-4 rounded-xl border border-line bg-paper-2/50 p-4 text-sm leading-relaxed text-ink">
            Read my active cat profile. Interpret a meow with flat ears at the window at night.
            If the result is defensive, add that observation to the journal with the note
            “WebMCP demo”.
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            No backend call is required: profile, decoder, and journal are all reused from the
            existing client-side app.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-paper p-5">
        <h2 className="font-display text-2xl text-ink">Exposed WebMCP tools</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {WEBMCP_TOOLS.map((tool) => (
            <div key={tool.name} className="rounded-xl bg-paper-2/50 p-4">
              <code className="text-sm font-semibold text-sage">{tool.name}</code>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">{tool.description}</p>
              <span className="mt-3 inline-block rounded-full border border-line px-2 py-0.5 text-[11px] text-ink-muted">
                {tool.annotations?.readOnlyHint ? "read-only" : "writes local journal"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-paper p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sage">Shared state</p>
            <h2 className="font-display mt-1 text-2xl text-ink">Recent journal observations</h2>
          </div>
          <span className="text-xs text-ink-muted">updates live after an agent write</span>
        </div>
        {journal.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-muted">
            No observations yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {journal.map((entry) => (
              <li key={entry.id} className="rounded-xl bg-paper-2/50 p-4">
                <div className="flex flex-wrap gap-2 text-xs text-ink-muted">
                  <span>{new Date(entry.createdAt).toLocaleString("en-GB")}</span>
                  <span>·</span>
                  <span>{MOOD_EN[String(entry.result.mood)] ?? "Unclassified"}</span>
                  <span>·</span>
                  <span>{Math.round(entry.result.confidence * 100)}% confidence</span>
                </div>
                <p className="mt-2 text-sm text-ink">
                  {entry.notes || "Observation saved through the shared Miaunolog journal."}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
