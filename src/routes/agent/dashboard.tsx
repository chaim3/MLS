import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
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
  const { t } = useTranslate();
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
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    description: "",
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
    setShowForm(true);
  };

  const openEditForm = (p: Project) => {
    setEditProject(p);
    const types = JSON.parse(p.property_types || "[]");
    setFormData({
      name: p.name,
      city: p.city,
      description: p.description || "",
      address: p.address || "",
      priceMin: p.price_min?.toString() || "",
      priceMax: p.price_max?.toString() || "",
      unitCount: p.unit_count?.toString() || "",
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
      city: formData.city,
      address: formData.address,
      propertyTypes: types,
      priceMin: parseInt(formData.priceMin) || 0,
      priceMax: parseInt(formData.priceMax) || 0,
      unitCount: parseInt(formData.unitCount) || 0,
      handoverDate: formData.handoverDate,
      status: formData.status,
      photoUrls,
      floorPlanUrls,
      websiteUrl: formData.websiteUrl,
    };

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

  return (
    <div className="min-h-dvh bg-gray-50" dir="rtl">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-blue-700">
            {t("site.name")}
          </Link>
          <div className="flex items-center gap-3">
            <LangSwitcher />
            {agent && (
              <button onClick={() => { setShowProfile(true); setProfilePhotoPreview(null); }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 underline underline-offset-2">
                {agent.photo_url ? (
                  <img src={agent.photo_url} alt={agent.name} className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {agent.name?.charAt(0) || "?"}
                  </span>
                )}
                {agent.name}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100"
            >
              {t("dashboard.logout")}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
          <button
            onClick={openCreateForm}
            className="rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white hover:bg-blue-700"
          >
            + {t("dashboard.newProject")}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-10 text-center text-gray-400">{t("dashboard.loading")}</div>
        )}

        {/* Projects List */}
        {!loading && projects.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center text-gray-400">
            {t("dashboard.empty")}
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {projects.map((p) => {
              const types = JSON.parse(p.property_types || "[]");
              return (
                <div
                  key={p.id}
                  className={`rounded-2xl p-5 shadow-sm ${
                    p.new_leads > 0
                      ? "bg-amber-50 border-2 border-amber-300"
                      : "bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">{p.name}</h3>
                      <p className="text-sm text-gray-500">
                        📍 {p.city}
                        {p.address ? `, ${p.address}` : ""}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
                        {p.price_min ? (
                          <span>₪{Number(p.price_min).toLocaleString()}</span>
                        ) : null}
                        {p.unit_count ? (
                          <span>{p.unit_count} יח"ד</span>
                        ) : null}
                        {p.handover_date ? (
                          <span>מסירה: {p.handover_date}</span>
                        ) : null}
                      </div>
                      {types.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {types.map((t: string) => (
                            <span
                              key={t}
                              className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewLeads(p.id, p.name)}
                        className={`rounded-lg px-3 py-1.5 text-sm hover:bg-green-100 ${
                          p.new_leads > 0
                            ? "bg-green-100 text-green-800 font-semibold"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {t("dashboard.leads")} ({p.total_leads})
                        {p.new_leads > 0 && (
                          <span className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {p.new_leads}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => openEditForm(p)}
                        className="rounded-lg bg-amber-50 px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-100"
                      >
                        {t("dashboard.edit")}
                      </button>
                      <button
                        onClick={() => deleteProject(p.id)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100"
                      >
                        {t("dashboard.delete")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Project Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {editProject ? t("dashboard.editProjectTitle") : t("dashboard.newProjectTitle")}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    name="name"
                    placeholder={t("dashboard.projectName")}
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    name="city"
                    placeholder={t("dashboard.projectCity")}
                    required
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    name="address"
                    placeholder={t("dashboard.projectAddress")}
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  />
                  <select
                    name="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="pre-sale">{t("status.pre-sale")}</option>
                    <option value="under-construction">{t("status.under-construction")}</option>
                    <option value="ready">{t("status.ready")}</option>
                  </select>
                  <input
                    name="priceMin"
                    type="number"
                    placeholder={t("dashboard.projectPriceMin")}
                    value={formData.priceMin}
                    onChange={(e) =>
                      setFormData({ ...formData, priceMin: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    name="priceMax"
                    type="number"
                    placeholder={t("dashboard.projectPriceMax")}
                    value={formData.priceMax}
                    onChange={(e) =>
                      setFormData({ ...formData, priceMax: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    name="unitCount"
                    type="number"
                    placeholder={t("dashboard.projectUnits")}
                    value={formData.unitCount}
                    onChange={(e) =>
                      setFormData({ ...formData, unitCount: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    name="handoverDate"
                    type="text"
                    placeholder={t("dashboard.projectHandover")}
                    value={formData.handoverDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        handoverDate: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    name="websiteUrl"
                    type="url"
                    placeholder={t("dashboard.projectWebsite")}
                    value={formData.websiteUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, websiteUrl: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    {t("dashboard.propertyTypes")}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.type_apt}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type_apt: e.target.checked,
                          })
                        }
                      />{" "}
                      {t("search.apartment")}
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.type_house}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type_house: e.target.checked,
                          })
                        }
                      />{" "}
                      {t("search.house")}
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.type_villa}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type_villa: e.target.checked,
                          })
                        }
                      />{" "}
                      {t("search.villa")}
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.type_duplex}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type_duplex: e.target.checked,
                          })
                        }
                      />{" "}
                      {t("search.duplex")}
                    </label>
                  </div>
                </div>

                <textarea
                  name="description"
                  placeholder={t("dashboard.projectDescription")}
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
                <textarea
                  name="photoUrls"
                  placeholder={t("dashboard.photoUrls")}
                  rows={3}
                  value={formData.photoUrls}
                  onChange={(e) =>
                    setFormData({ ...formData, photoUrls: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
                <textarea
                  name="floorPlanUrls"
                  placeholder={t("dashboard.floorPlanUrls")}
                  rows={3}
                  value={formData.floorPlanUrls}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      floorPlanUrls: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />

                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
                >
                  {t("dashboard.save")}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Leads Modal */}
        {showLeads && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {t("dashboard.leadsFor")} {currentProjectName}
                </h2>
                <button
                  onClick={() => setShowLeads(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              {currentLeads.length === 0 ? (
                <p className="py-4 text-center text-gray-400">
                  {t("dashboard.noLeads")}
                </p>
              ) : (
                <div className="space-y-3">
                  {currentLeads.map((l) => (
                    <div
                      key={l.id}
                      className="rounded-xl border border-gray-100 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold">{l.name}</p>
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
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">📞 {l.phone}</p>
                      {l.email && (
                        <p className="text-sm text-gray-500">📧 {l.email}</p>
                      )}
                      {l.message && (
                        <p className="mt-1 text-sm text-gray-700">
                          {l.message}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
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
                          className={`rounded-lg border px-2 py-1 text-xs font-medium ${
                            l.status === "new" ? "border-blue-300 bg-blue-50 text-blue-700" :
                            l.status === "contacted" ? "border-amber-300 bg-amber-50 text-amber-700" :
                            l.status === "in_progress" ? "border-purple-300 bg-purple-50 text-purple-700" :
                            l.status === "completed" ? "border-green-300 bg-green-50 text-green-700" :
                            "border-gray-300 bg-gray-50 text-gray-600"
                          }`}
                        >
                          <option value="new" className="text-blue-700">New</option>
                          <option value="contacted" className="text-amber-700">Contacted</option>
                          <option value="in_progress" className="text-purple-700">In Progress</option>
                          <option value="completed" className="text-green-700">Completed</option>
                        </select>
                        {l.assigned_agent_name && (
                          <span className="text-xs text-gray-400">→ {l.assigned_agent_name}</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-400">
                        {l.created_at}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Profile Edit Modal */}
        {showProfile && agent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">{t("dashboard.editProfile") || "עריכת פרופיל"}</h2>
                <button onClick={() => { setShowProfile(false); setProfilePhotoPreview(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              {/* Current Photo Preview */}
              <div className="mb-4 flex flex-col items-center">
                {profilePhotoPreview ? (
                  <img src={profilePhotoPreview} alt="Preview" className="h-20 w-20 rounded-full object-cover border-2 border-blue-200" />
                ) : agent.photo_url ? (
                  <img src={agent.photo_url} alt={agent.name} className="h-20 w-20 rounded-full object-cover border-2 border-blue-200" />
                ) : (
                  <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700 border-2 border-blue-200">
                    {agent.name?.charAt(0) || "?"}
                  </span>
                )}
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);

                  // First upload photo if a file was selected
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
                className="space-y-3"
              >
                {/* Photo Upload */}
                <div className="rounded-xl border border-dashed border-gray-300 p-3 text-center">
                  <label className="cursor-pointer">
                    <span className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      {t("dashboard.uploadPhoto") || "העלאת תמונת פרופיל"}
                    </span>
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
                  <p className="mt-2 text-xs text-gray-400">
                    {t("dashboard.photoHint") || "JPEG, PNG, WebP או GIF. גודל מקסימלי 5MB"}
                  </p>
                </div>

                <input name="name" defaultValue={agent.name} placeholder={t("agent.name")} required className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none" />
                <input name="email" type="email" defaultValue={agent.email} placeholder={t("agent.email")} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none" />
                <input name="phone" defaultValue={agent.phone} placeholder={t("agent.phone")} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none" />
                <input name="company" defaultValue={agent.company} placeholder={t("agent.company")} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none" />
                <textarea name="description" defaultValue={agent.description} placeholder={t("agent.description") || "תיאור"} rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none" />
                <button type="submit" className="w-full rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700">{t("dashboard.save") || "שמור"}</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}