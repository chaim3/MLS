import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useTranslate } from "~/lib/useTranslate";
import { LangSwitcher } from "~/components/LangSwitcher";
import { useState, useEffect, useRef } from "react";

export type Project = {
  id: string;
  name: string;
  description: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  property_types: string;
  price_min: number;
  price_max: number;
  unit_count: number;
  handover_date: string;
  status: string;
  photo_urls: string;
  floor_plan_urls: string;
  featured: number;
  created_at: string;
  agents?: { id: string; name: string; company: string; phone: string; email: string; description: string; photo_url: string }[];
};

const getProjects = createServerFn({ method: "GET" }).handler(async () => {
  const { getDbAsync } = await import("~/lib/db");
  const db = await getDbAsync();
  const rows = db
    .prepare(
      `SELECT p.* FROM projects p ORDER BY p.featured DESC, p.created_at DESC LIMIT 50`
    )
    .all() as Project[];
  // Attach agents to each project
  for (const p of rows) {
    p.agents = db.prepare(
      `SELECT a.id, a.name, a.company, a.email, a.phone, a.description, a.photo_url
       FROM project_agents pa JOIN agents a ON a.id = pa.agent_id
       WHERE pa.project_id = ?`
    ).all(p.id);
  }
  return rows;
});

export const Route = createFileRoute("/")({
  loader: () => getProjects(),
  component: Home,
});

function Home() {
  const serverProjects = Route.useLoaderData();
  const { t, lang } = useTranslate();
  const [projects, setProjects] = useState(serverProjects);
  const [filters, setFilters] = useState({ city: "", type: "", status: "", minPrice: "", maxPrice: "" });
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Apply filters whenever filters change
  useEffect(() => {
    let filtered = [...serverProjects];
    if (filters.city) filtered = filtered.filter((p) => p.city.includes(filters.city));
    if (filters.type) filtered = filtered.filter((p) => JSON.parse(p.property_types).includes(filters.type));
    if (filters.status) filtered = filtered.filter((p) => p.status === filters.status);
    if (filters.minPrice) filtered = filtered.filter((p) => p.price_max >= Number(filters.minPrice));
    if (filters.maxPrice) filtered = filtered.filter((p) => p.price_min <= Number(filters.maxPrice));
    setProjects(filtered);

    // Sync URL params (bookmarkable, no page reload)
    const params = new URLSearchParams();
    if (filters.city) params.set("city", filters.city);
    if (filters.type) params.set("type", filters.type);
    if (filters.status) params.set("status", filters.status);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    const qs = params.toString();
    const newUrl = qs ? "/?" + qs : "/";
    if (window.location.search !== (qs ? "?" + qs : "")) {
      window.history.replaceState(null, "", newUrl);
    }
  }, [filters.city, filters.type, filters.status, filters.minPrice, filters.maxPrice, serverProjects]);

  // Read initial filters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city") || "";
    const type = params.get("type") || "";
    const status = params.get("status") || "";
    const minPrice = params.get("minPrice") || "";
    const maxPrice = params.get("maxPrice") || "";
    setFilters({ city, type, status, minPrice, maxPrice });
  }, []);

  const hasFilters = filters.city || filters.type || filters.status || filters.minPrice || filters.maxPrice;

  const clearFilters = () => {
    setFilters({ city: "", type: "", status: "", minPrice: "", maxPrice: "" });
    window.history.replaceState(null, "", "/");
  };

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const cities = [...new Set(serverProjects.map((p) => p.city))];

  return (
    <div className="min-h-dvh bg-white" dir={lang === "he" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white">
        {/* Animated background shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 animate-pulse rounded-full bg-blue-400/20 blur-3xl" style={{ animationDuration: "4s" }}></div>
          <div className="absolute -bottom-20 -right-20 h-96 w-96 animate-pulse rounded-full bg-indigo-400/20 blur-3xl" style={{ animationDuration: "6s" }}></div>
          <div className="absolute left-1/3 top-1/4 h-48 w-48 animate-pulse rounded-full bg-blue-300/10 blur-3xl" style={{ animationDuration: "5s" }}></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <svg className="h-7 w-7" viewBox="0 0 64 64" fill="none">
                <rect width="64" height="64" rx="14" fill="white" fillOpacity="0.2"/>
                <path d="M32 16 L48 30 L45 30 L45 46 L37 46 L37 36 L27 36 L27 46 L19 46 L19 30 L16 30 Z" fill="white"/>
                <rect x="29" y="36" width="6" height="10" fill="#93c5fd" rx="1"/>
              </svg>
              <span className="text-xl font-bold tracking-tight">{t("site.name")}</span>
            </Link>
            <nav className="flex items-center gap-2 sm:gap-3">
              <LangSwitcher />
              <Link
                to="/about"
                className="hidden rounded-lg bg-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/30 sm:inline-block"
              >
                {t("nav.about")}
              </Link>
              <Link
                to="/blog"
                className="hidden rounded-lg bg-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/30 sm:inline-block"
              >
                {t("nav.blog")}
              </Link>
              <button 
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="rounded-lg bg-white/20 p-2 transition hover:bg-white/30 sm:hidden"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>
              <Link
                to="/agent/login"
                className="hidden rounded-lg bg-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/30 sm:inline-block"
              >
                {t("agent.login")}
              </Link>
              <Link
                to="/agent/signup"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-lg transition hover:bg-blue-50 hover:shadow-xl"
              >
                {t("agent.signup")}
              </Link>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-16 text-center sm:pb-24 sm:pt-20">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100 sm:text-xl">
              {t("hero.subtitle")}
            </p>
          </div>

          {/* Search Bar */}
          <div className="mx-auto mt-10 max-w-4xl">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mx-auto flex flex-wrap gap-2 rounded-2xl bg-white/10 p-2 backdrop-blur-md sm:flex-nowrap sm:gap-3 sm:p-3"
            >
              <div className="relative flex-1">
                <input
                  name="city"
                  list="cities"
                  value={filters.city}
                  onChange={(e) => updateFilter("city", e.target.value)}
                  placeholder={t("search.city")}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-blue-200 backdrop-blur-sm transition focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 min-w-[140px]"
                />
                <datalist id="cities">
                  {cities.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <select
                name="type"
                value={filters.type}
                onChange={(e) => updateFilter("type", e.target.value)}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-sm transition focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 min-w-[100px]"
              >
                <option value="" className="text-gray-800">{t("search.allTypes")}</option>
                <option value="דירה" className="text-gray-800">{t("search.apartment")}</option>
                <option value="בית" className="text-gray-800">{t("search.house")}</option>
                <option value="וילה" className="text-gray-800">{t("search.villa")}</option>
                <option value="דופלקס" className="text-gray-800">{t("search.duplex")}</option>
              </select>
              <select
                name="status"
                value={filters.status}
                onChange={(e) => updateFilter("status", e.target.value)}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-sm transition focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 min-w-[120px]"
              >
                <option value="" className="text-gray-800">{t("search.allStatuses")}</option>
                <option value="pre-sale" className="text-gray-800">{t("status.pre-sale")}</option>
                <option value="under-construction" className="text-gray-800">{t("status.under-construction")}</option>
                <option value="ready" className="text-gray-800">{t("status.ready")}</option>
              </select>
              <input
                name="minPrice"
                type="number"
                value={filters.minPrice}
                onChange={(e) => updateFilter("minPrice", e.target.value)}
                placeholder={t("search.minPrice")}
                className="w-28 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-blue-200 backdrop-blur-sm transition focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <input
                name="maxPrice"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => updateFilter("maxPrice", e.target.value)}
                placeholder={t("search.maxPrice")}
                className="w-28 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-blue-200 backdrop-blur-sm transition focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <button
                type="submit"
                className="rounded-xl bg-white px-8 py-3 font-bold text-blue-700 shadow-lg transition hover:bg-blue-50 hover:shadow-xl"
              >
                {t("search.search")}
              </button>
            </form>
          </div>

          {/* Mobile Search Panel */}
          {showMobileSearch && (
            <div className="mx-auto mt-3 max-w-4xl sm:hidden">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <div className="flex flex-col gap-3">
                  <select
                    value={filters.type}
                    onChange={(e) => updateFilter("type", e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-sm"
                  >
                    <option value="" className="text-gray-800">{t("search.allTypes")}</option>
                    <option value="דירה" className="text-gray-800">{t("search.apartment")}</option>
                    <option value="בית" className="text-gray-800">{t("search.house")}</option>
                    <option value="וילה" className="text-gray-800">{t("search.villa")}</option>
                    <option value="דופלקס" className="text-gray-800">{t("search.duplex")}</option>
                  </select>
                  <select
                    value={filters.status}
                    onChange={(e) => updateFilter("status", e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-sm"
                  >
                    <option value="" className="text-gray-800">{t("search.allStatuses")}</option>
                    <option value="pre-sale" className="text-gray-800">{t("status.pre-sale")}</option>
                    <option value="under-construction" className="text-gray-800">{t("status.under-construction")}</option>
                    <option value="ready" className="text-gray-800">{t("status.ready")}</option>
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => updateFilter("minPrice", e.target.value)}
                      placeholder={t("search.minPrice")}
                      className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-blue-200 backdrop-blur-sm"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter("maxPrice", e.target.value)}
                      placeholder={t("search.maxPrice")}
                      className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-blue-200 backdrop-blur-sm"
                    />
                  </div>
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="rounded-xl bg-white/20 px-4 py-2 text-sm text-white backdrop-blur-sm transition hover:bg-white/30"
                    >
                      ✕ Clear all filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-6 text-sm text-blue-100">
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">🏗️</span>
              <strong className="text-white">{projects.length}</strong> {t("stats.activeProjects")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">📞</span>
              {t("stats.directContact")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">🇮🇱</span>
              {t("stats.allCountry")}
            </span>
          </div>
        </div>

        {/* Curved separator */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-white" style={{ borderRadius: "50% 50% 0 0 / 100% 100% 0 0" }}></div>
      </header>

      {/* Project Grid */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        {/* Section header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t("search.results") || "פרויקטים חדשים"}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {projects.length} {t("stats.activeProjects")}
              {hasFilters ? ` — with filters applied` : ""}
            </p>
          </div>
          {/* Filter badge */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              ✕ Clear filters
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <p className="text-lg text-gray-500">{t("search.noResults")}</p>
            <p className="mt-2 text-gray-400">{t("search.noResultsHint")}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} lang={lang} t={t} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <svg className="h-6 w-6 text-blue-600" viewBox="0 0 64 64" fill="none">
                  <rect width="64" height="64" rx="14" fill="#2563eb" fillOpacity="0.15"/>
                  <path d="M32 16 L48 30 L45 30 L45 46 L37 46 L37 36 L27 36 L27 46 L19 46 L19 30 L16 30 Z" fill="#2563eb"/>
                  <rect x="29" y="36" width="6" height="10" fill="#93c5fd" rx="1"/>
                </svg>
                <span className="text-lg font-bold text-gray-900">{t("site.name")}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{t("site.tagline")}</p>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900">{t("footer.forBuyers") || "לקונים"}</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/" className="transition hover:text-blue-600">Browse Projects</a></li>
                <li><a href="/" className="transition hover:text-blue-600">Search by City</a></li>
                <li><a href="/" className="transition hover:text-blue-600">Featured Projects</a></li>
                <li><Link to="/blog" className="transition hover:text-blue-600">{t("footer.blog")}</Link></li>
                <li><Link to="/about" className="transition hover:text-blue-600">{t("footer.about")}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900">{t("footer.forAgents") || "יזמים"}</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/agent/signup" className="transition hover:text-blue-600">List Your Project</Link></li>
                <li><Link to="/agent/login" className="transition hover:text-blue-600">Agent Dashboard</Link></li>
                  <li><a href="/" className="transition hover:text-blue-600">Premium Plans</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900">{t("footer.contact") || "צור קשר"}</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>hello@example.com</li>
                <li>Tel Aviv, Israel</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-6 text-center text-sm text-gray-400">
            <p>{t("site.name")} © 2026 — {t("site.tagline")}</p>
            <div className="mt-2 flex items-center justify-center gap-4">
              <Link to="/privacy" className="transition hover:text-blue-600">Privacy Policy</Link>
              <Link to="/terms" className="transition hover:text-blue-600">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProjectCard({ project, lang, t }: { project: Project; lang: string; t: (key: string) => string }) {
  const [showDesc, setShowDesc] = useState(false);
  const descLocked = useRef(false);
  const photos: string[] = JSON.parse(project.photo_urls || "[]");
  const types: string[] = JSON.parse(project.property_types || "[]");
  const statusColors: Record<string, string> = {
    "pre-sale": "bg-amber-100 text-amber-800 border-amber-200",
    "under-construction": "bg-blue-100 text-blue-800 border-blue-200",
    ready: "bg-green-100 text-green-800 border-green-200",
  };

  return (
    <>
    <Link
      to={"/projects/" + project.id}
      onClick={(e) => { if (descLocked.current) { e.preventDefault(); return; } e.preventDefault(); window.location.href = "/projects/" + project.id; }}
      className={`group block overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-xl ${
        project.featured
          ? "border-amber-200 hover:border-amber-300 hover:-translate-y-1.5 hover:shadow-amber-100/50"
          : "border-gray-200 hover:border-blue-200 hover:-translate-y-1.5"
      }`}
    >
      {/* Image area */}
      <div className={`relative aspect-[16/10] overflow-hidden ${
        project.featured ? "bg-gradient-to-br from-amber-50 to-orange-50" : "bg-gradient-to-br from-blue-50 to-indigo-50"
      }`}>
        {photos.length > 0 ? (
          <img
            src={photos[0]}
            alt={project.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className={`h-14 w-14 transition duration-300 group-hover:scale-110 ${
              project.featured ? "text-amber-300" : "text-blue-300"
            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
        )}
        {/* Badges overlay */}
        <div className="absolute left-3 right-3 top-3 flex flex-wrap gap-1.5">
          <span
            className={
              "rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-sm backdrop-blur-sm " +
              (statusColors[project.status] || "bg-gray-100 text-gray-700 border-gray-200")
            }
          >
            {t("status." + project.status) || project.status}
          </span>
          {project.featured ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 shadow-sm">
              ★ {t("project.featured")}
            </span>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-snug text-gray-900 transition group-hover:text-blue-600">
            {project.name}
          </h3>
          {project.featured && (
            <span className="mt-0.5 shrink-0 text-amber-400" title="Featured">★</span>
          )}
        </div>
        <p className="mt-1.5 text-sm font-medium text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {project.city}
          </span>
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          {project.price_min > 0 && project.price_max > 0 ? (
            <span className="text-base font-bold text-gray-900">
              ₪{project.price_min.toLocaleString()} – ₪{project.price_max.toLocaleString()}
            </span>
          ) : project.price_min > 0 ? (
            <span className="text-base font-bold text-gray-900">
              {t("project.from")} ₪{project.price_min.toLocaleString()}
            </span>
          ) : null}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          {project.unit_count > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              {project.unit_count} {t("project.units")}
            </span>
          )}
          {project.handover_date && (
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              {project.handover_date}
            </span>
          )}
        </div>

        {types.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {types.map((type) => (
              <span key={type} className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 transition group-hover:bg-blue-50 group-hover:text-blue-700">
                {type}
              </span>
            ))}
          </div>
        )}

        {project.description && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); descLocked.current = true; setShowDesc(true); }}
            className="mt-3 w-full text-left text-sm leading-relaxed text-gray-600 line-clamp-3 hover:text-blue-600 transition"
          >
            {lang === "he" ? (project as any).description_he || project.description : (project as any).description_en || project.description}
          </button>
        )}

        {(project as any).website_url && (
          <div className="mt-2 border-t border-gray-100 pt-2">
            <a
              href={(project as any).website_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visit Website
            </a>
          </div>
        )}

        <div className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-400">
          {project.agents && project.agents.length > 0 ? (
            <span className="inline-flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              {project.agents.map(a => a.company || a.name).join(", ")}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
      {/* Description Modal */}
      {showDesc && project.description && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); descLocked.current = false; setShowDesc(false); }}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
              <button
                onClick={(e) => { e.stopPropagation(); descLocked.current = false; setShowDesc(false); }}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {lang === "he" ? (project as any).description_he || project.description : (project as any).description_en || project.description}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
