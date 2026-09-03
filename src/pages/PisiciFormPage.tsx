import { useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { notifyProfileChange } from "../components/AppShell";
import { getProfile, setActiveProfileId, upsertProfile } from "../lib/storage";
import type { Access, AgeBand, Sex } from "../lib/types";
import { nowIso, uid } from "../lib/types";

const COLORS = ["#3E5248", "#8B4A3F", "#5A7366", "#6B5B4F", "#4A5E6B", "#7A5C3E"];

export function PisiciFormPage({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { id?: string };
  const existing = mode === "edit" && params.id ? getProfile(params.id) : null;

  const [name, setName] = useState(existing?.name ?? "");
  const [ageBand, setAgeBand] = useState<AgeBand>(existing?.ageBand ?? "adult");
  const [sex, setSex] = useState<Sex | "">(existing?.sex ?? "");
  const [neutered, setNeutered] = useState<string>(
    existing?.neutered === true ? "yes" : existing?.neutered === false ? "no" : "unknown",
  );
  const [access, setAccess] = useState<Access>(existing?.access ?? "indoor");
  const [medicalNotes, setMedicalNotes] = useState(existing?.medicalNotes ?? "");
  const [avatarColor, setAvatarColor] = useState(existing?.avatarColor ?? COLORS[0]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const profile = {
      id: existing?.id ?? uid(),
      name: name.trim(),
      ageBand,
      birthYear: existing?.birthYear ?? null,
      sex: (sex || "unknown") as Sex,
      neutered: neutered === "yes" ? true : neutered === "no" ? false : null,
      access,
      medicalNotes,
      avatarColor,
      audioRefs: existing?.audioRefs ?? [],
      createdAt: existing?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    };
    upsertProfile(profile);
    if (mode === "create") setActiveProfileId(profile.id);
    notifyProfileChange();
    navigate({ to: "/pisici/$id", params: { id: profile.id } });
  }

  if (mode === "edit" && !existing) {
    return (
      <div className="py-12 text-center text-ink-muted">
        Profil negăsit.{" "}
        <Link to="/pisici" className="text-sage">
          Înapoi
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link to="/pisici" className="text-sm text-sage no-underline hover:underline">
        ← Pisici
      </Link>
      <h1 className="font-display text-3xl font-semibold">
        {mode === "create" ? "Pisică nouă" : "Editează profil"}
      </h1>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-ink-muted">Nume</span>
          <input
            className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-sage"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink-muted">Vârstă</span>
          <select
            className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2"
            value={ageBand}
            onChange={(e) => setAgeBand(e.target.value as AgeBand)}
          >
            <option value="kitten">Pui</option>
            <option value="adult">Adult</option>
            <option value="senior">Senior (≈10+)</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink-muted">Sex</span>
          <select
            className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2"
            value={sex}
            onChange={(e) => setSex(e.target.value as Sex | "")}
          >
            <option value="">—</option>
            <option value="female">Femă</option>
            <option value="male">Mascul</option>
            <option value="unknown">Necunoscut</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink-muted">Sterilizat / castrat</span>
          <select
            className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2"
            value={neutered}
            onChange={(e) => setNeutered(e.target.value)}
          >
            <option value="unknown">Necunoscut</option>
            <option value="yes">Da</option>
            <option value="no">Nu</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink-muted">Acces</span>
          <select
            className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2"
            value={access}
            onChange={(e) => setAccess(e.target.value as Access)}
          >
            <option value="indoor">Doar în casă</option>
            <option value="outdoor">Iese afară</option>
            <option value="both">Ambele</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-ink-muted">Note medicale (opțional)</span>
          <textarea
            className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm"
            rows={3}
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
            maxLength={2000}
            placeholder="Ex.: hipertiroidie — control anual"
          />
        </label>
        <div>
          <span className="text-xs font-medium text-ink-muted">Culoare</span>
          <div className="mt-2 flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAvatarColor(c)}
                className={`h-8 w-8 rounded-full border-2 ${
                  avatarColor === c ? "border-ink" : "border-transparent"
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-sage py-3 text-sm font-semibold text-paper"
        >
          Salvează
        </button>
      </form>
    </div>
  );
}
