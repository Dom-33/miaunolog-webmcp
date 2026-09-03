import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { getActiveProfile } from "../lib/storage";
import type { CatProfile } from "../lib/types";
import { t } from "../lib/labels";

const NAV = [
  { to: "/", label: "Decoder", match: (p: string) => p === "/" },
  { to: "/sunete", label: "Sunete", match: (p: string) => p.startsWith("/sunete") },
  { to: "/corp", label: "Corp", match: (p: string) => p === "/corp" },
  { to: "/asculta", label: "Ascultă", match: (p: string) => p === "/asculta" },
  { to: "/jurnal", label: "Jurnal", match: (p: string) => p === "/jurnal" },
  { to: "/webmcp", label: "WebMCP", match: (p: string) => p === "/webmcp" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [profile, setProfile] = useState<CatProfile | null>(null);

  useEffect(() => {
    setProfile(getActiveProfile());
    const onFocus = () => setProfile(getActiveProfile());
    window.addEventListener("focus", onFocus);
    window.addEventListener("miaunolog-profile", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("miaunolog-profile", onFocus);
    };
  }, [pathname]);

  return (
    <div className="paper-grain min-h-screen pb-20 md:pb-8">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage text-sm text-paper">
              M
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              Miaunolog
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-full px-3 py-1.5 text-sm no-underline transition ${
                  item.match(pathname)
                    ? "bg-sage text-paper"
                    : "text-ink-muted hover:bg-paper-2 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/pisici"
              className={`rounded-full px-3 py-1.5 text-sm no-underline transition ${
                pathname.startsWith("/pisici")
                  ? "bg-sage text-paper"
                  : "text-ink-muted hover:bg-paper-2 hover:text-ink"
              }`}
            >
              Pisici
            </Link>
          </nav>

          <Link
            to="/pisici"
            className="flex max-w-[40%] items-center gap-2 rounded-full border border-line bg-paper-2/60 px-3 py-1.5 text-sm no-underline"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: profile?.avatarColor ?? "#3E5248" }}
            />
            <span className="truncate text-ink-muted">
              {profile ? profile.name : t("noProfile")}
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-paper/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg justify-between px-2 py-2">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[11px] no-underline ${
                item.match(pathname) ? "text-sage font-semibold" : "text-ink-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function notifyProfileChange() {
  window.dispatchEvent(new Event("miaunolog-profile"));
}
