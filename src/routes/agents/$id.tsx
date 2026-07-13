import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslate } from "~/lib/useTranslate";
import { LangSwitcher } from "~/components/LangSwitcher";

export const Route = createFileRoute("/agents/$id")({
  head: (ctx) => {
    const data = ctx.loaderData as any;
    if (!data || !data.agent) return {};
    const agent = data.agent;
    return {
      meta: [
        { title: agent.name + " - MLS Israel" },
        { name: "description", content: agent.description || "Real estate agent at MLS Israel" },
        { property: "og:title", content: agent.name + " - MLS Israel Agent" },
        { property: "og:description", content: agent.description || "Contact " + agent.name + " for new construction projects in Israel." },
        { property: "og:url", content: "https://mls-israel.ctonew.app/agents/" + agent.id },
      ],
    };
  },
  loader: async ({ params }) => {

    const base = typeof window !== 'undefined' ? '' : 'http://localhost:3000';
    const res = await fetch(`${base}/api/public/agents/${params.id}`);
    if (!res.ok) return null;
    return res.json();
  },
  component: AgentDetail,
});

function AgentDetail() {
  const { t, lang } = useTranslate();
  const data = Route.useLoaderData() as any;

  if (!data || !data.agent) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white" dir={lang === "he" ? "rtl" : "ltr"}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{t("agent.detailTitle") || "הנציג לא נמצא"}</h1>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">{t("project.backHome") || "חזרה לדף הבית"}</Link>
        </div>
      </div>
    );
  }

  const { agent, projects } = data;

  const statusColors: Record<string, string> = {
    "pre-sale": "bg-amber-100 text-amber-800 border-amber-200",
    "under-construction": "bg-blue-100 text-blue-800 border-blue-200",
    ready: "bg-green-100 text-green-800 border-green-200",
  };

  return (
    <div className="min-h-dvh bg-gray-50" dir={lang === "he" ? "rtl" : "ltr"}>
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <svg className="h-6 w-6 text-blue-600" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="14" fill="#2563eb" fillOpacity="0.15"/>
              <path d="M32 16 L48 30 L45 30 L45 46 L37 46 L37 36 L27 36 L27 46 L19 46 L19 30 L16 30 Z" fill="#2563eb"/>
              <rect x="29" y="36" width="6" height="10" fill="#93c5fd" rx="1"/>
            </svg>
            <span className="text-lg font-bold text-gray-900">{t("site.name")}</span>
          </Link>
          <LangSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Agent Profile Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="relative h-40 bg-gradient-to-r from-blue-600 to-blue-400">
            <div className="absolute -bottom-12 left-8">
              {agent.photo_url ? (
                <img src={agent.photo_url} alt={agent.name} className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-blue-100 text-3xl font-bold text-blue-600 shadow-md">
                  {agent.name?.charAt(0) || "?"}
                </div>
              )}
            </div>
          </div>
          <div className="px-8 pb-8 pt-16">
            <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
            {agent.company && <p className="mt-1 text-sm text-gray-500">{agent.company}</p>}
            <div className="mt-4 flex flex-wrap gap-4">
              {agent.email && (
                <a href={"mailto:" + agent.email} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  {agent.email}
                </a>
              )}
              {agent.phone && (
                <a href={"tel:" + agent.phone} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  {agent.phone}
                </a>
              )}
            </div>
            {agent.description && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">{t("agent.description") || "תיאור"}</h3>
                <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">{agent.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Projects Section */}
        <div className="mt-10">
          <h2 className="mb-6 text-xl font-bold text-gray-900">
            {t("agent.detailProjects") || "הפרויקטים של"} {agent.name}
          </h2>
          {projects.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-gray-400">
              {t("agent.detailNoProjects") || "אין פרויקטים כרגע"}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p: any) => {
                const photos: string[] = JSON.parse(p.photo_urls || "[]");
                const types: string[] = JSON.parse(p.property_types || "[]");
                return (
                  <Link
                    key={p.id}
                    to={"/projects/" + p.id}
                    className={`group block overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-xl ${
                      p.featured
                        ? "border-amber-200 hover:border-amber-300 hover:-translate-y-1.5 hover:shadow-amber-100/50"
                        : "border-gray-200 hover:border-blue-200 hover:-translate-y-1.5"
                    }`}
                  >
                    <div className={`relative aspect-[16/10] overflow-hidden ${
                      p.featured ? "bg-gradient-to-br from-amber-50 to-orange-50" : "bg-gradient-to-br from-blue-50 to-indigo-50"
                    }`}>
                      {photos.length > 0 ? (
                        <img src={photos[0]} alt={p.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <svg className={`h-14 w-14 transition duration-300 group-hover:scale-110 ${
                            p.featured ? "text-amber-300" : "text-blue-300"
                          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute left-3 right-3 top-3 flex flex-wrap gap-1.5">
                        <span className={"rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-sm backdrop-blur-sm " + (statusColors[p.status] || "bg-gray-100 text-gray-700 border-gray-200")}>
                          {t("status." + p.status) || p.status}
                        </span>
                        {p.featured ? (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 shadow-sm">
                            ★ {t("project.featured")}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-bold leading-snug text-gray-900 transition group-hover:text-blue-600">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">{p.city}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-bold text-gray-900">
                        {p.price_min > 0 && <span>₪{p.price_min.toLocaleString()}</span>}
                        {p.price_min > 0 && p.price_max > 0 && <span>–</span>}
                        {p.price_max > 0 && <span>₪{p.price_max.toLocaleString()}</span>}
                      </div>
                      {types.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {types.map((type) => (
                            <span key={type} className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 transition group-hover:bg-blue-50 group-hover:text-blue-700">
                              {type}
                            </span>
                          ))}
                        </div>
                      )}
                      {p.handover_date && (
                        <p className="mt-2 text-xs text-gray-400">
                          {t("project.handover") || "מסירה"}: {p.handover_date}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-gray-400">
          <p>{t("site.name")} © 2026 — {t("site.tagline")}</p>
        </div>
      </footer>
    </div>
  );
}
