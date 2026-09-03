import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AppShell } from "./components/AppShell";
import { DecoderPage } from "./pages/DecoderPage";
import { SunetePage } from "./pages/SunetePage";
import { SuneteDetailPage } from "./pages/SuneteDetailPage";
import { CorpPage } from "./pages/CorpPage";
import { AscultaPage } from "./pages/AscultaPage";
import { JurnalPage } from "./pages/JurnalPage";
import { PisiciPage } from "./pages/PisiciPage";
import { PisiciFormPage } from "./pages/PisiciFormPage";
import { PisiciDetailPage } from "./pages/PisiciDetailPage";
import { WebMcpPage } from "./pages/WebMcpPage";

const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-2xl text-sage">Pagina nu există</h1>
      <p className="mt-2 text-ink-muted">Întoarce-te la decoder sau la catalogul de sunete.</p>
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DecoderPage,
  validateSearch: (s: Record<string, unknown>): { sunet?: string; profile?: string } => ({
    ...(typeof s.sunet === "string" ? { sunet: s.sunet } : {}),
    ...(typeof s.profile === "string" ? { profile: s.profile } : {}),
  }),
});

const suneteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sunete",
  component: SunetePage,
});

const suneteDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sunete/$id",
  component: SuneteDetailPage,
});

const corpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/corp",
  component: CorpPage,
});

const ascultaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/asculta",
  component: AscultaPage,
  validateSearch: (
    s: Record<string, unknown>,
  ): { profile?: string; attach?: "journal" | "profile" } => ({
    ...(typeof s.profile === "string" ? { profile: s.profile } : {}),
    ...(s.attach === "profile" || s.attach === "journal" ? { attach: s.attach } : {}),
  }),
});

const jurnalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/jurnal",
  component: JurnalPage,
  validateSearch: (s: Record<string, unknown>): { profile?: string } => ({
    ...(typeof s.profile === "string" ? { profile: s.profile } : {}),
  }),
});

const pisiciRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pisici",
  component: PisiciPage,
});

const pisiciNouRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pisici/nou",
  component: () => <PisiciFormPage mode="create" />,
});

const pisiciDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pisici/$id",
  component: PisiciDetailPage,
});

const pisiciEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pisici/$id/edit",
  component: () => <PisiciFormPage mode="edit" />,
});


const webMcpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/webmcp",
  component: WebMcpPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  suneteRoute,
  suneteDetailRoute,
  corpRoute,
  ascultaRoute,
  jurnalRoute,
  pisiciRoute,
  pisiciNouRoute,
  pisiciDetailRoute,
  pisiciEditRoute,
  webMcpRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
