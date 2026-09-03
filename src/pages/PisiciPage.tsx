import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { notifyProfileChange } from "../components/AppShell";
import {
  deleteProfile,
  getActiveProfileId,
  listProfiles,
  setActiveProfileId,
} from "../lib/storage";
import { label, t } from "../lib/labels";

export function PisiciPage() {
  const [list, setList] = useState(() => listProfiles());
  const [active, setActive] = useState(() => getActiveProfileId());

  function refresh() {
    setList(listProfiles());
    setActive(getActiveProfileId());
    notifyProfileChange();
  }

  function select(id: string) {
    setActiveProfileId(id);
    refresh();
  }

  function remove(id: string) {
    if (!confirm("Delete this profile and related observations?")) return;
    deleteProfile(id);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-sage">Profiles</p>
          <h1 className="font-display mt-1 text-3xl font-semibold">Cats</h1>
          <p className="mt-2 text-ink-muted">
            Unlimited, on this device only. The active profile changes decoder weighting.
          </p>
        </div>
        <Link
          to="/pisici/nou"
          className="rounded-xl bg-sage px-4 py-2 text-sm font-semibold text-paper no-underline"
        >
          New cat
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-12 text-center">
          <p className="text-ink-muted">No cats yet.</p>
          <Link to="/pisici/nou" className="mt-2 inline-block text-sage">
            Create the first profile
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((p) => (
            <li
              key={p.id}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${
                active === p.id ? "border-sage bg-sage/5" : "border-line bg-paper-2/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-10 w-10 rounded-full"
                  style={{ background: p.avatarColor ?? "#3E5248" }}
                />
                <div>
                  <div className="font-display text-lg text-ink">{p.name}</div>
                  <div className="text-xs text-ink-muted">
                    {label.ageBand(p.ageBand)}
                    {p.neutered === true ? ` · ${t("neuteredYes")}` : p.neutered === false ? ` · ${t("neuteredNo")}` : ""}
                    {active === p.id ? " · active" : ""}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {active !== p.id && (
                  <button
                    type="button"
                    onClick={() => select(p.id)}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium"
                  >
                    Activate
                  </button>
                )}
                <Link
                  to="/pisici/$id"
                  params={{ id: p.id }}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs no-underline text-ink"
                >
                  Details
                </Link>
                <Link
                  to="/pisici/$id/edit"
                  params={{ id: p.id }}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs no-underline text-ink"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="rounded-lg px-3 py-1.5 text-xs text-clay"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
