import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslate } from "~/lib/useTranslate";
import { LangSwitcher } from "~/components/LangSwitcher";

type Project = {
  id: string;
  name: string;
  description: string;
  city: string;
  address: string;
  price_min: number;
  price_max: number;
  unit_count: number;
  handover_date: string;
  status: string;
  photo_urls: string;
  floor_plan_urls: string;
  website_url: string;
  property_types: string;
  created_at: string;
  total_leads: number;
  new_leads: number;
};

type Lead = {
  id: string;
  project_id: string;
  assigned_agent_id: string;
  assigned_agent_name: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
};

type Agent = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  photo_url: string;
  description: string;
};

export const Route = createFileRoute("/agent/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { t, lang } = useTranslate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showLeads, setShowLeads] = useState(false);
  const [currentLeads, setCurrentLeads] = useState<Lead[]>([]);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [currentProjectId, setCurrentProjectId] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const projectPhotoInputRef = useRef<HTMLInputElement>(null);
  const brochureInputRef = useRef<HTMLInputElement>(null);
  const floorPlanInputRef = useRef<HTMLInputElement>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    description: "",
    descriptionHe: "",
    descriptionEn: "",
    address: "",
    priceMin: "",
    priceMax: "",
    unitCount: "",
    handoverDate: "",
    status: "pre-sale",
    photoUrls: "",
    floorPlanUrls: "",
    websiteUrl: "",
    type_apt: false,
    type_house: false,
    type_villa: false,
    type_duplex: false,
  });

  const loadProjects = useCallback(async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    if (!data.agent) {
      window.location.href = "/agent/login";
      return;
    }
    setAgent(data.agent);
    setProjects(data.projects);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const openCreateForm = () => {
    setEditProject(null);
    setFormData({
      name: "",
      city: "",
      description: "",
      descriptionHe: "",
      descriptionEn: "",
      address: "",
      priceMin: "",
      priceMax: "",
      unitCount: "",
      handoverDate: "",
      status: "pre-sale",
      photoUrls: "",
      floorPlanUrls: "",
      websiteUrl: "",
      brochureUrl: "",
      type_apt: false,
      type_house: false,
      type_villa: false,
      type_duplex: false,
    });
    setShowForm(true);
  };

  const openEditForm = (p: Project) => {
    setEditProject(p);
    const types = JSON.parse(p.property_types || "[]");
    setFormData({
      name: p.name,
      city: p.city,
      description: p.description || "",
      descriptionHe: (p as any).description_he || "",
      descriptionEn: (p as any).description_en || "",
      address: p.address || "",
      priceMin: p.price_min === 0 ? "" : p.price_min?.toString() || "",
      priceMax: p.price_max === 0 ? "" : p.price_max?.toString() || "",
      unitCount: p.unit_count === 0 ? "" : p.unit_count?.toString() || "",
      handoverDate: p.handover_date || "",
      status: p.status || "pre-sale",
      photoUrls: (JSON.parse(p.photo_urls || "[]") as string[]).join("\n"),
      floorPlanUrls: (JSON.parse(p.floor_plan_urls || "[]") as string[]).join("\n"),
      websiteUrl: (p as any).website_url || "",
      type_apt: types.includes("דירה"),
      type_house: types.includes("בית"),
      type_villa: types.includes("וילה"),
      type_duplex: types.includes("דופלקס"),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const types: string[] = [];
    if (formData.type_apt) types.push("דירה");
    if (formData.type_house) types.push("בית");
    if (formData.type_villa) types.push("וילה");
    if (formData.type_duplex) types.push("דופלקס");

    const photoUrls = formData.photoUrls.split("\n").map(s => s.trim()).filter(Boolean);
    const floorPlanUrls = formData.floorPlanUrls.split("\n").map(s => s.trim()).filter(Boolean);

    const body: Record<string, unknown> = {
      id: editProject?.id,
      name: formData.name,
      description: formData.description,
      description_he: formData.descriptionHe,
      description_en: formData.descriptionEn,
      city: formData.city,
      address: formData.address,
      propertyTypes: types,
      priceMin: parseInt(formData.priceMin) || undefined,
      priceMax: parseInt(formData.priceMax) || undefined,
      unitCount: parseInt(formData.unitCount) || undefined,
      handoverDate: formData.handoverDate,
      status: formData.status,
      photoUrls,
      floorPlanUrls,
      websiteUrl: formData.websiteUrl,
    };

    // Upload brochure file if selected
    const brochureFile = brochureInputRef.current?.files?.[0];
    if (brochureFile) {
      const uploadFd = new FormData();
      uploadFd.append("file", brochureFile);
      const uploadRes = await fetch("/api/admin/projects/upload-file", { method: "POST", body: uploadFd });
      const uploadData = await uploadRes.json();
      if (uploadData.success) {
        body.brochureUrl = uploadData.url;
      } else {
        alert(uploadData.error || "Brochure upload failed");
        return;
      }
    }
    // Upload floor plan file if selected
    const fpFile = floorPlanInputRef.current?.files?.[0];
    if (fpFile) {
      const uploadFd = new FormData();
      uploadFd.append("file", fpFile);
      const uploadRes = await fetch("/api/admin/projects/upload-floorplan", { method: "POST", body: uploadFd });
      const uploadData = await uploadRes.json();
      if (uploadData.success) {
        const existing = body.floorPlanUrls || [];
        body.floorPlanUrls = [...existing, uploadData.url];
      } else {
        alert(uploadData.error || "Floor plan upload failed");
        return;
      }
    }
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      setShowForm(false);
      loadProjects();
    } else {
      alert(data.error || "שגיאה בשמירה");
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("למחוק את הפרויקט?")) return;
    await fetch("/api/projects?id=" + id, { method: "DELETE" });
    loadProjects();
  };

  const viewLeads = async (projectId: string, projectName: string) => {
    const res = await fetch("/api/leads?projectId=" + projectId);
    const data = await res.json();
    setCurrentLeads(data.leads || []);
    setCurrentProjectName(projectName);
    setCurrentProjectId(projectId);
    setShowLeads(true);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const handleProjectPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setFormData((prev) => ({
          ...prev,
          photoUrls: prev.photoUrls ? prev.photoUrls + "\n" + dataUrl : dataUrl,
        }));
      }
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      "pre-sale": "bg-amber-50 text-amber-700 border-amber-200",
      "under-construction": "bg-blue-50 text-blue-700 border-blue-200",
      ready: "bg-green-50 text-green-700 border-green-200",
    };
    return colors[status] || "bg-gray-50 text-gray-600 border-gray-200";
  };

  const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
      "pre-sale": t("status.pre-sale"),
      "under-construction": t("status.under-construction"),
      ready: t("status.ready"),
    };
    return labels[status] || status;
  };

  const statusSelectColors = (status: string) => {
    const colors: Record<string, string> = {
      new: "border-blue-300 bg-blue-50 text-blue-700",
      contacted: "border-amber-300 bg-amber-50 text-amber-700",
      in_progress: "border-purple-300 bg-purple-50 text-purple-700",
      completed: "border-green-300 bg-green-50 text-green-700",
    };
    return colors[status] || "border-gray-300 bg-gray-50 text-gray-600";
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-gray-50 to-blue-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <svg className="h-6 w-6" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="14" fill="white" fillOpacity="0.25"/>
              <path d="M32 16 L48 30 L45 30 L45 46 L37 46 L37 36 L27 36 L27 46 L19 46 L19 30 L16 30 Z" fill="white"/>
              <rect x="29" y="36" width="6" height="10" fill="#93c5fd" rx="1"/>
            </svg>
            {t("site.name")}
          </Link>
          <div className="flex items-center gap-3">
            <LangSwitcher />
            {agent && (
              <button
                onClick={() => { setShowProfile(true); setProfilePhotoPreview(null); }}
                className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-sm text-white transition hover:bg-white/25"
              >
                {agent.photo_url ? (
                  <img src={agent.photo_url} alt={agent.name} className="h-7 w-7 rounded-full object-cover ring-2 ring-white/30" />
                ) : (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white ring-2 ring-white/30">
                    {agent.name?.charAt(0) || "?"}
                  </span>
                )}
                <span className="hidden sm:inline">{agent.name}</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="rounded-lg bg-white/15 px-3 py-1.5 text-sm text-white transition hover:bg-red-500/30"
            >
              {t("dashboard.logout")}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("dashboard.title")}</h1>
            <p className="mt-1 text-sm text-gray-500">{projects.length} {t("stats.activeProjects")}</p>
          </div>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 hover:shadow-lg active:scale-[0.97]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            {t("dashboard.newProject")}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-4 text-gray-500">{t("dashboard.loading")}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-8 py-20 shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <svg className="h-8 w-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-600">{t("dashboard.empty")}</p>
            <button
              onClick={openCreateForm}
              className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white shadow-md transition hover:bg-blue-700"
            >
              + {t("dashboard.newProject")}
            </button>
          </div>
        )}

        {/* Projects List */}
        {!loading && projects.length > 0 && (
          <div className="space-y-4">
            {projects.map((p) => {
              const types = JSON.parse(p.property_types || "[]");
              const photos: string[] = JSON.parse(p.photo_urls || "[]");
              return (
                <div
                  key={p.id}
                  className={`group relative overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md ${
                    p.new_leads > 0
                      ? "ring-2 ring-amber-400 bg-amber-50/30"
                      : "ring-1 ring-gray-100"
                  }`}
                >
                  {/* New leads indicator */}
                  {p.new_leads > 0 && (
                    <div className="absolute left-0 top-0 z-10 rounded-br-xl bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      {lang === "he" ? `${p.new_leads} ${t("dashboard.leads")} ${t("dashboard.new")}` : `${p.new_leads} ${t("dashboard.new")} ${t("dashboard.leads")}`}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row">
                    {/* Photo Thumbnail */}
                    {photos.length > 0 && (
                      <div className="relative h-40 w-full shrink-0 overflow-hidden sm:h-auto sm:w-52">
                        <img
                          src={photos[0]}
                          alt={p.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent sm:bg-gradient-to-r sm:from-black/20 sm:to-transparent"></div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex flex-1 flex-col justify-center p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {p.name}
                          </h3>
                          <p className="mt-0.5 text-sm text-gray-500">
                            <svg className="inline-block h-3.5 w-3.5 align-text-bottom text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>{" "}
                            {p.city}{p.address ? `, ${p.address}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge(p.status)}`}>
                            {statusLabel(p.status)}
                          </span>
                        </div>
                      </div>

                      {/* Price & Specs */}
                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
                        {p.price_min > 0 && (
                          <span className="text-base font-bold text-gray-900">
                            ₪{Number(p.price_min).toLocaleString()}
                            {p.price_max > 0 && p.price_max !== p.price_min ? ` – ₪${Number(p.price_max).toLocaleString()}` : ""}
                          </span>
                        )}
                        {p.unit_count > 0 && (
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                            {p.unit_count} {t("project.units")}
                          </span>
                        )}
                        {p.handover_date && (
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            {p.handover_date}
                          </span>
                        )}
                      </div>

                      {/* Property Types */}
                      {types.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {types.map((type: string) => (
                            <span key={type} className="rounded-lg bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                              {type}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                        <button
                          onClick={() => viewLeads(p.id, p.name)}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                            p.new_leads > 0
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                          </svg>
                          {t("dashboard.leads")} ({p.total_leads})
                          {p.new_leads > 0 && (
                            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                              {p.new_leads}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => openEditForm(p)}
                          className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                          {t("dashboard.edit")}
                        </button>
                        <button
                          onClick={() => deleteProject(p.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                          {t("dashboard.delete")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Project Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-900">
                  {editProject ? t("dashboard.editProjectTitle") : t("dashboard.newProjectTitle")}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Basic Info */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Basic Info</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">{t("dashboard.projectName")}</label>
                      <div className="relative">
                        <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                        </svg>
                        <input
                          name="name"
                          placeholder={t("dashboard.projectName")}
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">{t("dashboard.projectCity")}</label>
                      <div className="relative">
                        <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <input
                          name="city"
                          placeholder={t("dashboard.projectCity")}
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">{t("dashboard.projectAddress")}</label>
                      <input
                        name="address"
                        placeholder={t("dashboard.projectAddress")}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">{t("dashboard.projectStatus")}</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                      >
                        <option value="pre-sale">{t("status.pre-sale")}</option>
                        <option value="under-construction">{t("status.under-construction")}</option>
                        <option value="ready">{t("status.ready")}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pricing & Units */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Pricing & Units</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">{t("dashboard.projectPriceMin")}</label>
                      <input
                        name="priceMin"
                        type="number"
                        placeholder={t("dashboard.projectPriceMin")}
                        value={formData.priceMin}
                        onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">{t("dashboard.projectPriceMax")}</label>
                      <input
                        name="priceMax"
                        type="number"
                        placeholder={t("dashboard.projectPriceMax")}
                        value={formData.priceMax}
                        onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">{t("dashboard.projectUnits")}</label>
                      <input
                        name="unitCount"
                        type="number"
                        placeholder={t("dashboard.projectUnits")}
                        value={formData.unitCount}
                        onChange={(e) => setFormData({ ...formData, unitCount: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Dates & Website */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Dates & Links</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">{t("dashboard.projectHandover")}</label>
                      <input
                        name="handoverDate"
                        type="text"
                        placeholder={t("dashboard.projectHandover")}
                        value={formData.handoverDate}
                        onChange={(e) => setFormData({ ...formData, handoverDate: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">{t("dashboard.projectWebsite")}</label>
                      <input
                        name="websiteUrl"
                        type="url"
                        placeholder={t("dashboard.projectWebsite")}
                        value={formData.websiteUrl}
                        onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Brochure & Floor Plan Uploads */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Brochure & Floor Plan Files</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Brochure URL</label>
                      <input
                        name="brochureUrl"
                        type="text"
                        placeholder="https://... or upload a file below"
                        value={formData.brochureUrl}
                        onChange={(e) => setFormData({ ...formData, brochureUrl: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Upload Brochure PDF</label>
                      <input ref={brochureInputRef} type="file" accept=".pdf" className="w-full text-sm text-gray-500 file:mr-2 file:rounded-lg file:border-0 file:bg-amber-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-amber-700 hover:file:bg-amber-100" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-medium text-gray-500">Upload Floor Plan (PDF/PNG/JPG)</label>
                      <input ref={floorPlanInputRef} type="file" accept=".pdf,.png,.jpg" className="w-full text-sm text-gray-500 file:mr-2 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                  </div>
                </div>

                {/* Property Types */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">{t("dashboard.propertyTypes")}</h3>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { key: "type_apt", label: t("search.apartment") },
                      { key: "type_house", label: t("search.house") },
                      { key: "type_villa", label: t("search.villa") },
                      { key: "type_duplex", label: t("search.duplex") },
                    ].map(({ key, label }) => (
                      <label key={key} className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition ${
                        formData[key as keyof typeof formData]
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}>
                        <input
                          type="checkbox"
                          checked={formData[key as keyof typeof formData] as boolean}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                          className="hidden"
                        />
                        {formData[key as keyof typeof formData] ? (
                          <svg className="h-4 w-4 shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        ) : (
                          <svg className="h-4 w-4 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                          </svg>
                        )}
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Descriptions */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">תיאורים / Descriptions</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">תיאור (עברית)</label>
                      <div className="relative">
                        <textarea
                          name="descriptionHe"
                          placeholder="תיאור הפרויקט בעברית"
                          rows={4}
                          value={formData.descriptionHe}
                          onChange={(e) => setFormData({ ...formData, descriptionHe: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition resize-y"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!formData.descriptionHe) return;
                            try {
                              const res = await fetch("/api/translate", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ q: formData.descriptionHe, source: "he", target: "en" }),
                              });
                              const data = await res.json();
                              if (data.translatedText) {
                                setFormData(prev => ({ ...prev, descriptionEn: prev.descriptionEn ? prev.descriptionEn + "\n\n" + data.translatedText : data.translatedText }));
                              }
                            } catch (e) {}
                          }}
                          className="absolute left-2 bottom-2 rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                        >
                          🔄 תרגם לאנגלית
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Description (English)</label>
                      <div className="relative">
                        <textarea
                          name="descriptionEn"
                          placeholder="Project description in English"
                          rows={4}
                          value={formData.descriptionEn}
                          onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition resize-y"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!formData.descriptionEn) return;
                            try {
                              const res = await fetch("/api/translate", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ q: formData.descriptionEn, source: "en", target: "he" }),
                              });
                              const data = await res.json();
                              if (data.translatedText) {
                                setFormData(prev => ({ ...prev, descriptionHe: prev.descriptionHe ? prev.descriptionHe + "\n\n" + data.translatedText : data.translatedText }));
                              }
                            } catch (e) {}
                          }}
                          className="absolute left-2 bottom-2 rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                        >
                          🔄 Translate to Hebrew
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Photos & Floor Plans</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">{t("dashboard.photoUrls")}</label>
                      <textarea
                        name="photoUrls"
                        placeholder={t("dashboard.photoUrls")}
                        rows={3}
                        value={formData.photoUrls}
                        onChange={(e) => setFormData({ ...formData, photoUrls: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition resize-y"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => projectPhotoInputRef.current?.click()}
                        className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        {t("dashboard.uploadProjectPhoto")}
                      </button>
                      <input
                        ref={projectPhotoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProjectPhotoUpload}
                      />
                      <span className="text-xs text-gray-400">{t("dashboard.photoHint")}</span>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">{t("dashboard.floorPlanUrls")}</label>
                      <textarea
                        name="floorPlanUrls"
                        placeholder={t("dashboard.floorPlanUrls")}
                        rows={3}
                        value={formData.floorPlanUrls}
                        onChange={(e) => setFormData({ ...formData, floorPlanUrls: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition resize-y"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="border-t border-gray-100 pt-5">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-bold text-white shadow-md transition hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:scale-[0.99]"
                  >
                    {t("dashboard.saveProject")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Leads Modal */}
        {showLeads && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-900">
                  {t("dashboard.leadsFor")} {currentProjectName}
                </h2>
                <button
                  onClick={() => setShowLeads(false)}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div className="p-6">
                {currentLeads.length === 0 ? (
                  <div className="flex flex-col items-center py-10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                      <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                      </svg>
                    </div>
                    <p className="mt-3 text-gray-500">{t("dashboard.noLeads")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentLeads.map((l) => (
                      <div key={l.id} className="group rounded-xl border border-gray-100 bg-white p-4 transition hover:border-gray-200 hover:shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900">{l.name}</p>
                              <span className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${statusSelectColors(l.status || "new")}`}>
                                {t("leads.status." + (l.status || "new"))}
                              </span>
                            </div>
                            <div className="mt-2 space-y-1 text-sm text-gray-500">
                              <p className="flex items-center gap-1.5">
                                <span>📞</span> {l.phone}
                              </p>
                              {l.email && (
                                <p className="flex items-center gap-1.5">
                                  <span>📧</span> {l.email}
                                </p>
                              )}
                            </div>
                            {l.message && (
                              <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm leading-relaxed text-gray-700">
                                "{l.message}"
                              </p>
                            )}
                            <div className="mt-3 flex items-center gap-3">
                              <select
                                value={l.status || "new"}
                                onChange={async (e) => {
                                  await fetch("/api/leads/status", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ id: l.id, status: e.target.value }),
                                  });
                                  viewLeads(currentProjectId, currentProjectName);
                                }}
                                className={`rounded-lg border px-2 py-1 text-xs font-medium focus:outline-none ${statusSelectColors(l.status || "new")}`}
                              >
                                <option value="new">{t("leads.status.new")}</option>
                                <option value="contacted">{t("leads.status.contacted")}</option>
                                <option value="in_progress">{t("leads.status.in_progress")}</option>
                                <option value="completed">{t("leads.status.completed")}</option>
                              </select>
                              {l.assigned_agent_name && (
                                <span className="text-xs text-gray-400">→ {l.assigned_agent_name}</span>
                              )}
                              <span className="text-xs text-gray-400 mr-auto">{l.created_at}</span>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              if (!confirm("Delete this lead?")) return;
                              await fetch("/api/leads/delete", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: l.id }),
                              });
                              viewLeads(currentProjectId, currentProjectName);
                            }}
                            className="shrink-0 rounded-lg p-1.5 text-gray-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile Edit Modal */}
        {showProfile && agent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-bold text-gray-900">{t("dashboard.editProfile") || "עריכת פרופיל"}</h2>
                <button onClick={() => { setShowProfile(false); setProfilePhotoPreview(null); }} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Current Photo Preview */}
              <div className="flex flex-col items-center px-6 pt-6 pb-4">
                <div className="relative">
                  {profilePhotoPreview ? (
                    <img src={profilePhotoPreview} alt="Preview" className="h-24 w-24 rounded-full object-cover ring-4 ring-blue-50" />
                  ) : agent.photo_url ? (
                    <img src={agent.photo_url} alt={agent.name} className="h-24 w-24 rounded-full object-cover ring-4 ring-blue-50" />
                  ) : (
                    <span className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-3xl font-bold text-blue-600 ring-4 ring-blue-50">
                      {agent.name?.charAt(0) || "?"}
                    </span>
                  )}
                </div>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const photoFile = fd.get("photo") as File;
                  if (photoFile && photoFile.size > 0) {
                    const photoFormData = new FormData();
                    photoFormData.append("photo", photoFile);
                    const photoRes = await fetch("/api/agent/photo", {
                      method: "POST",
                      body: photoFormData,
                    });
                    const photoData = await photoRes.json();
                    if (!photoData.success) {
                      alert(photoData.error || "שגיאה בהעלאת התמונה");
                      return;
                    }
                  }
                  const res = await fetch("/api/agent/profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: fd.get("name"),
                      email: fd.get("email"),
                      company: fd.get("company"),
                      phone: fd.get("phone"),
                      description: fd.get("description"),
                    }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    alert(t("dashboard.profileUpdated") || "הפרופיל עודכן");
                    setShowProfile(false);
                    setProfilePhotoPreview(null);
                    window.location.reload();
                  } else {
                    alert(data.error || "שגיאה בעדכון הפרופיל");
                  }
                }}
                className="space-y-4 px-6 pb-6"
              >
                {/* Photo Upload */}
                <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-4 text-center transition hover:border-blue-200 hover:bg-blue-50">
                  <label className="cursor-pointer">
                    <div className="flex flex-col items-center gap-1">
                      <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <span className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        {t("dashboard.uploadPhoto") || "העלאת תמונת פרופיל"}
                      </span>
                    </div>
                    <input
                      name="photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setProfilePhotoPreview(ev.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <p className="mt-2 text-xs text-gray-400">{t("dashboard.photoHint") || "JPEG, PNG, WebP או GIF. גודל מקסימלי 5MB"}</p>
                </div>

                <div className="space-y-3">
                  <input name="name" defaultValue={agent.name} placeholder={t("agent.name")} required className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
                  <div className="grid grid-cols-2 gap-3">
                    <input name="email" type="email" defaultValue={agent.email} placeholder={t("agent.email")} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
                    <input name="phone" defaultValue={agent.phone} placeholder={t("agent.phone")} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
                  </div>
                  <input name="company" defaultValue={agent.company} placeholder={t("agent.company")} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
                  <textarea name="description" defaultValue={agent.description} placeholder={t("agent.description") || "תיאור"} rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition resize-y" />
                </div>

                <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-bold text-white shadow-md transition hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:scale-[0.99]">
                  {t("dashboard.save") || "שמור"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}