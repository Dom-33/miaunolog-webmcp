import { Link, useParams } from "@tanstack/react-router";
import { getProfile, setActiveProfileId } from "../lib/storage";
import { label, t } from "../lib/labels";
import { notifyProfileChange } from "../components/AppShell";

export function PisiciDetailPage() {
  const { id } = useParams({ from: "/pisici/$id" });
  const p = getProfile(id);

  if (!p) {
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
      <div className="flex items-center gap-4">
        <span
          className="h-16 w-16 rounded-full"
          style={{ background: p.avatarColor ?? "#3E5248" }}
        />
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">{p.name}</h1>
          <p className="text-sm text-ink-muted">
            {label.ageBand(p.ageBand)}
            {` · ${label.access(p.access)}`}
          </p>
        </div>
      </div>

      {p.medicalNotes && (
        <section className="rounded-2xl border border-line p-4">
          <h2 className="text-sm font-semibold">Note medicale</h2>
          <p className="mt-1 text-sm text-ink-muted">{p.medicalNotes}</p>
        </section>
      )}

      <section className="rounded-2xl border border-line p-4">
        <h2 className="text-sm font-semibold">Audio pe profil</h2>
        {p.audioRefs.length === 0 ? (
          <p className="mt-2 text-sm text-ink-muted">Niciun clip atașat.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-ink-muted">
            {p.audioRefs.map((a) => (
              <li key={a.id}>
                {a.label ?? "Clip"} · {new Date(a.createdAt).toLocaleString("ro-RO")}
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/asculta"
          search={{ profile: p.id, attach: "profile" }}
          className="mt-3 inline-block text-sm text-sage no-underline hover:underline"
        >
          Înregistrează pentru acest profil →
        </Link>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveProfileId(p.id);
            notifyProfileChange();
          }}
          className="rounded-xl bg-sage px-4 py-2 text-sm font-semibold text-paper"
        >
          Activează în decoder
        </button>
        <Link
          to="/pisici/$id/edit"
          params={{ id: p.id }}
          className="rounded-xl border border-line px-4 py-2 text-sm no-underline text-ink"
        >
          Editează
        </Link>
        <Link
          to="/jurnal"
          search={{ profile: p.id }}
          className="rounded-xl border border-line px-4 py-2 text-sm no-underline text-ink"
        >
          Jurnalul ei
        </Link>
      </div>
    </div>
  );
}
