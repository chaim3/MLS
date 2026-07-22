import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslate } from "~/lib/useTranslate";
import { translateCity, translatePropertyType } from "~/lib/i18n";
import { LangSwitcher } from "~/components/LangSwitcher";
import { useState } from "react";
export const Route = createFileRoute("/projects/$id")({
  head: (ctx) => {
    const project = ctx.loaderData as any;
    if (!project) return {};
    return {
      meta: [
        { title: project.name + " - MLS Israel" },
        { name: "description", content: project.description_he || project.description || "" },
        { property: "og:title", content: project.name + " - MLS Israel" },
        { property: "og:description", content: project.description_en || project.description || "" },
        { property: "og:url", content: "https://mls-israel.ctonew.app/projects/" + project.id },
      ],
    };
  },
  loader: async ({ params }) => {

    const base = typeof window !== 'undefined' ? '' : 'http://localhost:3000';
    const res = await fetch(`${base}/api/public/projects?id=${params.id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.project || null;
  },
  component: ProjectDetail,
});

function ProjectDetail() {
  const { t, lang } = useTranslate();
  const project = Route.useLoaderData() as any;
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [sending, setSending] = useState(false);

  if (!project) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white" dir={lang === "he" ? "rtl" : "ltr"}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{t("project.notFound") || "הפרויקט לא נמצא"}</h1>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">{t("project.backToHome") || "חזרה לדף הבית"}</Link>
        </div>
      </div>
    );
  }

  const photos: string[] = JSON.parse(project.photo_urls || "[]");
  const floorPlans: string[] = JSON.parse(project.floor_plan_urls || "[]");
  const types: string[] = JSON.parse(project.property_types || "[]");
  const agents: any[] = project.agents || [];

  const statusColors: Record<string, string> = {
    "pre-sale": "bg-amber-100 text-amber-800 border-amber-200",
    "under-construction": "bg-blue-100 text-blue-800 border-blue-200",
    ready: "bg-green-100 text-green-800 border-green-200",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId && agents.length > 1) {
      alert(t("project.selectAgent") || "אנא בחר נציג");
      return;
    }
    setSending(true);
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const res = await fetch(`/api/leads?projectId=${project.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        phone: fd.get("phone"),
        email: fd.get("email"),
        message: fd.get("message"),
        agentId: selectedAgentId || (agents.length === 1 ? agents[0].id : null),
      }),
    });
    const data = await res.json();
    setSending(false);
    if (data.success) {
      form.reset();
      setSelectedAgentId("");
      alert(t("project.contactSuccess"));
    } else {
      alert(data.error || t("project.contactError"));
    }
  };

  return (
    <div className="min-h-dvh bg-gray-50" dir={lang === "he" ? "rtl" : "ltr"}>
      {/* Header */}
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
          <nav className="flex items-center gap-3">
            <LangSwitcher />
            <Link to="/agent/login" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
              {t("agent.login")}
            </Link>
          </nav>
        </div>
      </header>

      {/* Project Detail */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-blue-600">{t("site.name")}</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{project.name}</span>
        </div>

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <div className="mb-8 overflow-hidden rounded-2xl">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="sm:row-span-2">
                <img src={photos[0]} alt={project.name} className="h-full w-full object-cover" />
              </div>
              {photos.slice(1, 3).map((url: string, i: number) => (
                <img key={i} src={url} alt={project.name} className="h-48 w-full object-cover sm:h-full" />
              ))}
            </div>
          </div>
        )}

        {/* Title & Info */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="mt-2 flex items-center gap-2 text-lg text-gray-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {project.address}, {translateCity(project.city, lang)}
              </p>
            </div>
            <span className={"rounded-full border px-4 py-1.5 text-sm font-medium " + (statusColors[project.status] || "bg-gray-100 text-gray-700")}>
              {t("status." + project.status) || project.status}
            </span>
          </div>

          {/* Price & specs */}
          <div className="mt-6 flex flex-wrap gap-8">
            {project.price_min > 0 && project.price_max > 0 && (
              <div>
                <p className="text-sm text-gray-500">{t("project.price")}</p>
                <p className="text-2xl font-bold text-gray-900">₪{project.price_min.toLocaleString()} – ₪{project.price_max.toLocaleString()}</p>
              </div>
            )}
            {project.unit_count > 0 && (
              <div>
                <p className="text-sm text-gray-500">{t("project.units")}</p>
                <p className="text-xl font-bold text-gray-900">{project.unit_count}</p>
              </div>
            )}
            {project.handover_date && (
              <div>
                <p className="text-sm text-gray-500">{t("project.handover")}</p>
                <p className="text-xl font-bold text-gray-900">{project.handover_date}</p>
              </div>
            )}
          </div>

          {/* Property types */}
          {types.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {types.map((type: string) => (
                <span key={type} className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                  {translatePropertyType(type, lang)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {(project.description || project.description_he || project.description_en) && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-bold">{t("project.description")}</h2>
            <p className="whitespace-pre-line leading-relaxed text-gray-700">{lang === "he" ? project.description_he || project.description : project.description_en || project.description}</p>
          </div>
        )}


        {/* Website & Brochure */}
        {(project.website_url || project.brochure_url) && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-bold">{t("project.website") || "Website & Brochure"}</h2>
            <div className="flex flex-wrap gap-4">
              {project.website_url && (
                <a
                  href={project.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  {project.website_url.replace(/^https?:\/\//, "")}
                </a>
              )}
              {project.brochure_url && (
                <a
                  href={project.brochure_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-green-700 hover:bg-green-100 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  Download Brochure (PDF)
                </a>
              )}
            </div>
          </div>
        )}
        {/* Floor Plans */}
        {floorPlans.length > 0 && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-bold">{t("project.floorPlans")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {floorPlans.map((url: string, i: number) => (
                <img key={i} src={url} alt={`תוכנית קומה ${i + 1}`} className="h-64 w-full rounded-xl object-contain bg-white p-2" />
              ))}
            </div>
          </div>
        )}

        {/* Agents & Contact Form */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Agents Cards */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{t("project.agents") || "נציגי מכירות"}</h2>
            {agents.length === 0 ? (
              <p className="text-gray-500">{t("project.noAgents") || "אין נציגים זמינים כרגע"}</p>
            ) : (
              agents.map((agent: any) => (
                <div
                  key={agent.id}
                  className={`cursor-pointer rounded-2xl border-2 bg-white p-5 shadow-sm transition hover:shadow-md ${
                    selectedAgentId === agent.id ? "border-blue-500 bg-blue-50" : "border-transparent"
                  }`}
                  onClick={() => setSelectedAgentId(agent.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700 overflow-hidden">
                      {agent.photo_url ? (
                        <img src={agent.photo_url} alt={agent.name} className="h-full w-full object-cover" />
                      ) : (
                        <span>{agent.name?.charAt(0) || "?"}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{agent.name}</p>
                        {selectedAgentId === agent.id && (
                          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">{t("project.selected") || "Agent Selected"}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{agent.company}</p>
                      {agent.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{agent.description}</p>
                      )}
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="text-gray-500">📧 {agent.email}</p>
                        <p className="text-gray-500">📞 {agent.phone}</p>
                      <Link to={"/agents/" + agent.id} className="inline-block mt-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline">{t("agent.detailViewProject") || "צפה בפרופיל"}</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">{t("project.contactForm")}</h2>
            {agents.length > 1 && (
              <p className="mt-1 text-sm text-amber-600">
                {t("project.selectAgentHint") || ""}
              </p>
            )}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <input
                name="name"
                placeholder={t("project.contactName")}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
              />
              <input
                name="phone"
                type="tel"
                placeholder={t("project.contactPhone")}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
              />
              <input
                name="email"
                type="email"
                placeholder={t("project.contactEmail")}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
              />
              <textarea
                name="message"
                placeholder={t("project.contactMessage")}
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? t("project.sending") || "שולח..." : t("project.contactSubmit")}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
