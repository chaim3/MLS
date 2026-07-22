import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { LangSwitcher } from "~/components/LangSwitcher";

type AdminData = {
  projects: any[];
  agents: any[];
  leads: any[];
  blogPosts: any[];
};

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"projects" | "agents" | "leads" | "blog">("projects");
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [showAddBlog, setShowAddBlog] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [editingAgent, setEditingAgent] = useState<any | null>(null);
  const [viewingAgent, setViewingAgent] = useState<any | null>(null);
  const [formMsg, setFormMsg] = useState("");
  const [addDescHe, setAddDescHe] = useState("");
  const [addDescEn, setAddDescEn] = useState("");
  const addPhotoInputRef = useRef<HTMLInputElement>(null);
  const editPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleAddPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        const form = document.getElementById("addProjectForm") as HTMLFormElement;
        const input = form?.querySelector('[name="photo_url"]') as HTMLInputElement;
        if (input) input.value = dataUrl;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        const form = document.getElementById("editProjectForm") as HTMLFormElement;
        const input = form?.querySelector('[name="photo_url"]') as HTMLInputElement;
        if (input) input.value = dataUrl;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const loadData = useCallback(async () => {
    const res = await fetch("/api/admin/dashboard");
    if (res.status === 401) {
      window.location.href = "/admin/login";
      return;
    }
    const d = await res.json();
    if (d.error) {
      window.location.href = "/admin/login";
      return;
    }
    setData(d);
    setLoading(false);
  }, []);

  useEffect(() => { loadData() }, [loadData]);

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await fetch("/api/admin/projects/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadData();
  };

  const deleteAgent = async (id: string) => {
    if (!confirm("Delete this agent and all their projects?")) return;
    await fetch("/api/admin/agents/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadData();
  };

  const toggleFeatured = async (id: string) => {
    await fetch("/api/admin/projects/featured", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadData();
  };

  const handleAddProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormMsg("");
    const fd = new FormData(e.currentTarget);
    const body: Record<string, string> = {};
    fd.forEach((v, k) => { body[k] = v as string });
    const res = await fetch("/api/admin/projects/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.error) {
      setFormMsg(json.error);
    } else {
      setShowAddProject(false);
      setFormMsg("");
      loadData();
    }
  };

  const handleAddAgent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormMsg("");
    const fd = new FormData(e.currentTarget);
    const body: Record<string, string> = {};
    fd.forEach((v, k) => { body[k] = v as string });
    const res = await fetch("/api/admin/agents/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.error) {
      setFormMsg(json.error);
    } else {
      setShowAddAgent(false);
      setFormMsg("");
      loadData();
    }
  };

  const handleUpdateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormMsg("");
    const fd = new FormData(e.currentTarget);
    const body: Record<string, string> = { id: editingProject.id };
    fd.forEach((v, k) => { body[k] = v as string });
    const res = await fetch("/api/admin/projects/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.error) {
      setFormMsg(json.error);
    } else {
      setEditingProject(null);
      setFormMsg("");
      loadData();
    }
  };

  const handleUpdateAgent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormMsg("");
    const fd = new FormData(e.currentTarget);
    const body: Record<string, string> = { id: editingAgent.id };
    fd.forEach((v, k) => { body[k] = v as string });
    const res = await fetch("/api/admin/agents/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.error) {
      setFormMsg(json.error);
    } else {
      setEditingAgent(null);
      setFormMsg("");
      loadData();
    }
  };

  return (
    <div className="min-h-dvh bg-gray-900 text-white" dir="rtl">
      <header className="border-b border-gray-700 bg-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold">
            <span className="text-white">MLS Israel</span>{" "}
            <span className="text-amber-400">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <LangSwitcher />
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/";
              }}
              className="rounded-lg bg-red-800 px-3 py-1.5 text-sm text-red-200 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

        {/* Stats */}
        {data && (
          <div className="mb-6 grid grid-cols-4 gap-4">
            <div className="rounded-xl bg-gray-800 p-4 text-center border border-gray-700">
              <p className="text-3xl font-bold text-amber-400">{data.projects.length}</p>
              <p className="text-sm text-gray-400">Projects</p>
            </div>
            <div className="rounded-xl bg-gray-800 p-4 text-center border border-gray-700">
              <p className="text-3xl font-bold text-amber-400">{data.projects.filter((p:any) => p.featured).length}</p>
              <p className="text-sm text-gray-400">Featured</p>
            </div>
            <div className="rounded-xl bg-gray-800 p-4 text-center border border-gray-700">
              <p className="text-3xl font-bold text-blue-400">{data.agents.length}</p>
              <p className="text-sm text-gray-400">Agents</p>
            </div>
            <div className="rounded-xl bg-gray-800 p-4 text-center border border-gray-700">
              <p className="text-3xl font-bold text-green-400">{data.leads.length}</p>
              <p className="text-sm text-gray-400">Leads</p>
            </div>
            <div className="rounded-xl bg-gray-800 p-4 text-center border border-gray-700">
              <p className="text-3xl font-bold text-purple-400">{data.blogPosts?.length || 0}</p>
              <p className="text-sm text-gray-400">Blog Posts</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-4 flex gap-2">
          {(["projects", "agents", "leads", "blog"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === t
                  ? "bg-amber-500 text-gray-900"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {t === "projects" ? "Projects" : t === "agents" ? "Agents" : t === "leads" ? "Leads" : "Blog"}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && <div className="py-10 text-center text-gray-500">Loading...</div>}

        {/* Projects Table */}
        {!loading && tab === "projects" && data && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">{data.projects.length} projects</span>
              <button
                onClick={() => setShowAddProject(true)}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-amber-500"
              >
                + Add Project
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-right">Name</th>
                    <th className="px-4 py-3 text-right">City</th>
                    <th className="px-4 py-3 text-right">Agent</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">Status</th>
                    <th className="px-4 py-3 text-right">Featured</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {data.projects.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-800">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-gray-400">{p.city}</td>
                      <td className="px-4 py-3 text-gray-400">{p.agent_name || p.agent_company}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {p.price_min ? `₪${Number(p.price_min).toLocaleString()}` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                          p.status === "ready" ? "bg-green-900 text-green-300" :
                          p.status === "under-construction" ? "bg-blue-900 text-blue-300" :
                          "bg-amber-900 text-amber-300"
                        }`}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleFeatured(p.id)}
                          className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                            p.featured
                              ? "bg-amber-500 text-gray-900 hover:bg-amber-400"
                              : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                          }`}
                        >
                          {p.featured ? "★ Featured" : "☆ Standard"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setEditingProject(p)}
                            className="rounded bg-blue-900 px-2 py-1 text-xs text-blue-300 hover:bg-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteProject(p.id)}
                            className="rounded bg-red-900 px-2 py-1 text-xs text-red-300 hover:bg-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Agents Table */}
        {!loading && tab === "agents" && data && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">{data.agents.length} agents</span>
              <button
                onClick={() => setShowAddAgent(true)}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-amber-500"
              >
                + Add Agent
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-right">Name</th>
                    <th className="px-4 py-3 text-right">Company</th>
                    <th className="px-4 py-3 text-right">Email</th>
                    <th className="px-4 py-3 text-right">Phone</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {data.agents.map((a: any) => (
                    <tr key={a.id} className="hover:bg-gray-800">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {a.photo_url ? (
                            <img src={a.photo_url} alt={a.name} className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 text-xs font-bold text-blue-300">
                              {a.name?.charAt(0) || "?"}
                            </span>
                          )}
                          <button
                            onClick={() => setViewingAgent(a)}
                            className="font-medium text-blue-300 hover:text-blue-100 transition-colors text-right"
                          >
                            {a.name}
                          </button>
                          {a.email === "admin@example.com" && (
                            <span className="mr-2 rounded bg-amber-900 px-1.5 py-0.5 text-xs text-amber-300">Admin</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{a.company || "-"}</td>
                      <td className="px-4 py-3 text-gray-400">{a.email}</td>
                      <td className="px-4 py-3 text-gray-400">{a.phone || "-"}</td>
                      <td className="px-4 py-3">
                        {a.email !== "admin@example.com" && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => setEditingAgent(a)}
                              className="rounded bg-blue-900 px-2 py-1 text-xs text-blue-300 hover:bg-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteAgent(a.id)}
                              className="rounded bg-red-900 px-2 py-1 text-xs text-red-300 hover:bg-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Leads Table */}
        {!loading && tab === "leads" && data && (
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-right">Name</th>
                  <th className="px-4 py-3 text-right">Phone</th>
                  <th className="px-4 py-3 text-right">Project</th>
                  <th className="px-4 py-3 text-right">Agent</th>
                  <th className="px-4 py-3 text-right">Status</th>
                  <th className="px-4 py-3 text-right">Date</th>
                  <th className="px-4 py-3 text-right">Message</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {data.leads.map((l: any) => (
                  <tr key={l.id} className="hover:bg-gray-800">
                    <td className="px-4 py-3 font-medium">{l.name}</td>
                    <td className="px-4 py-3 text-gray-400">{l.phone}</td>
                    <td className="px-4 py-3 text-gray-400">{l.project_name}</td>
                    <td className="px-4 py-3 text-gray-400">{l.assigned_agent_name || "-"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={l.status || "new"}
                        onChange={async (e) => {
                          await fetch("/api/leads/status", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: l.id, status: e.target.value }),
                          });
                          loadData();
                        }}
                        className={`rounded-lg border px-2 py-1 text-xs font-medium ${
                          l.status === "new" ? "border-blue-500 bg-blue-900/30 text-blue-300" :
                          l.status === "contacted" ? "border-amber-500 bg-amber-900/30 text-amber-300" :
                          l.status === "in_progress" ? "border-purple-500 bg-purple-900/30 text-purple-300" :
                          l.status === "completed" ? "border-green-500 bg-green-900/30 text-green-300" :
                          "border-gray-600 bg-gray-700 text-gray-300"
                        }`}
                      >
                        <option value="new" className="bg-gray-800 text-blue-300">New</option>
                        <option value="contacted" className="bg-gray-800 text-amber-300">Contacted</option>
                        <option value="in_progress" className="bg-gray-800 text-purple-300">In Progress</option>
                        <option value="completed" className="bg-gray-800 text-green-300">Completed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{l.created_at}</td>
                    <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{l.message || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={async () => {
                          if (!confirm("Delete this lead?")) return;
                          await fetch("/api/leads/delete", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: l.id }),
                          });
                          loadData();
                        }}
                        className="rounded-lg bg-red-700/50 px-2 py-1 text-xs text-red-300 hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Blog Tab */}
        {!loading && tab === "blog" && data && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">{data.blogPosts?.length || 0} posts</span>
              <button
                onClick={() => { setShowAddBlog(true); setEditingBlog(null); setFormMsg(""); }}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-amber-500"
              >
                + New Post
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-right">Title</th>
                    <th className="px-4 py-3 text-right">Slug</th>
                    <th className="px-4 py-3 text-right">Published</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {(data.blogPosts || []).map((post: any) => (
                    <tr key={post.id} className="hover:bg-gray-800">
                      <td className="px-4 py-3 font-medium">{post.title}</td>
                      <td className="px-4 py-3 text-gray-400">{post.slug}</td>
                      <td className="px-4 py-3 text-gray-400">{post.published_at || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => { setEditingBlog(post); setShowAddBlog(true); setFormMsg(""); }}
                            className="rounded bg-blue-900 px-2 py-1 text-xs text-blue-300 hover:bg-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm("Delete this post?")) return;
                              await fetch("/api/admin/blog/delete", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: post.id }),
                              });
                              loadData();
                            }}
                            className="rounded bg-red-900 px-2 py-1 text-xs text-red-300 hover:bg-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add Project Modal */}
      {showAddProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-2xl bg-gray-800 p-6 shadow-2xl border border-gray-700">
            <h2 className="mb-4 text-xl font-bold">Add New Project</h2>
            <form id="addProjectForm" onSubmit={handleAddProject} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Project Name *</label>
                  <input name="name" required className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. מגדל היובל" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">City *</label>
                  <input name="city" required className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. Tel Aviv" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">תיאור (עברית)</label>
                <div className="relative">
                  <textarea name="description_he" rows={2} value={addDescHe} onChange={(e) => setAddDescHe(e.target.value)} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="תיאור הפרויקט בעברית..." />
                  <button type="button" onClick={async () => { if (!addDescHe) return; try { const res = await fetch("/api/translate", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({q:addDescHe,source:"he",target:"en"})}); const data = await res.json(); if (data.translatedText) setAddDescEn(prev => prev ? prev + "\n\n" + data.translatedText : data.translatedText); } catch(e) {} }} className="absolute left-2 bottom-2 rounded bg-amber-600/30 px-2 py-1 text-xs text-amber-300 hover:bg-amber-600/50">🔄 תרגם לאנגלית</button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Description (English)</label>
                <div className="relative">
                  <textarea name="description_en" rows={2} value={addDescEn} onChange={(e) => setAddDescEn(e.target.value)} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Project description in English..." />
                  <button type="button" onClick={async () => { if (!addDescEn) return; try { const res = await fetch("/api/translate", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({q:addDescEn,source:"en",target:"he"})}); const data = await res.json(); if (data.translatedText) setAddDescHe(prev => prev ? prev + "\n\n" + data.translatedText : data.translatedText); } catch(e) {} }} className="absolute left-2 bottom-2 rounded bg-amber-600/30 px-2 py-1 text-xs text-amber-300 hover:bg-amber-600/50">🔄 Translate to Hebrew</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Address</label>
                  <input name="address" className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Street address" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Status</label>
                  <select name="status" className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="pre-sale">Pre-sale</option>
                    <option value="under-construction">Under Construction</option>
                    <option value="ready">Ready</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Price Min (₪)</label>
                  <input name="price_min" type="number" className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. 2000000" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Price Max (₪)</label>
                  <input name="price_max" type="number" className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. 5000000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Handover Date</label>
                  <input name="handover_date" type="date" className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Agent ID (optional)</label>
                  <select name="agent_id" className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="">Assign to admin</option>
                    {data?.agents.filter(a => a.email !== "admin@example.com").map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Photo URL (public https:// link)</label>
                  <div className="flex gap-2">
                    <input name="photo_url" className="flex-1 w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="https://example.com/photo.jpg" />
                    <button type="button" onClick={() => addPhotoInputRef.current?.click()} className="shrink-0 rounded-lg bg-amber-600/30 px-3 py-2 text-xs text-amber-300 hover:bg-amber-600/50 whitespace-nowrap">
                      Upload Photo
                    </button>
                  </div>
                  <input ref={addPhotoInputRef} type="file" accept="image/*" className="hidden" onChange={handleAddPhotoUpload} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Project Website URL</label>
                  <input name="website_url" className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="https://project-website.co.il" />
                </div>
              </div>
              {formMsg && <p className="text-sm text-red-400">{formMsg}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setShowAddProject(false); setFormMsg("") }} className="rounded-lg bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-500">Cancel</button>
                <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-amber-500">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Agent Modal */}
      {showAddAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-2xl bg-gray-800 p-6 shadow-2xl border border-gray-700">
            <h2 className="mb-4 text-xl font-bold">Add New Agent</h2>
            <form onSubmit={handleAddAgent} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Name *</label>
                  <input name="name" required className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Agent name" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Company</label>
                  <input name="company" className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Company name" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Email *</label>
                <input name="email" type="email" required className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="agent@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Password *</label>
                  <input name="password" type="password" required className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Password" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Phone</label>
                  <input name="phone" className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Phone number" />
                </div>
              </div>
              {formMsg && <p className="text-sm text-red-400">{formMsg}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setShowAddAgent(false); setFormMsg("") }} className="rounded-lg bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-500">Cancel</button>
                <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-amber-500">Create Agent</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-2xl bg-gray-800 p-6 shadow-2xl border border-gray-700" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <h2 className="mb-4 text-xl font-bold">Edit Project</h2>
            <form id="editProjectForm" onSubmit={handleUpdateProject} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Project Name</label>
                  <input name="name" defaultValue={editingProject.name} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">City</label>
                  <input name="city" defaultValue={editingProject.city} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">תיאור (עברית)</label>
                <div className="relative">
                  <textarea name="description_he" rows={3} value={editingProject?.description_he || ""} onChange={(e) => setEditingProject({ ...editingProject!, description_he: e.target.value })} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  <button type="button" onClick={async () => { const val = editingProject?.description_he; if (!val) return; try { const res = await fetch("/api/translate", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({q:val,source:"he",target:"en"})}); const data = await res.json(); if (data.translatedText) setEditingProject(prev => prev ? { ...prev, description_en: (prev.description_en ? prev.description_en + "\n\n" : "") + data.translatedText } : prev); } catch(e) {} }} className="absolute left-2 bottom-2 rounded bg-amber-600/30 px-2 py-1 text-xs text-amber-300 hover:bg-amber-600/50">🔄 תרגם לאנגלית</button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Description (English)</label>
                <div className="relative">
                  <textarea name="description_en" rows={3} value={editingProject?.description_en || ""} onChange={(e) => setEditingProject({ ...editingProject!, description_en: e.target.value })} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  <button type="button" onClick={async () => { const val = editingProject?.description_en; if (!val) return; try { const res = await fetch("/api/translate", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({q:val,source:"en",target:"he"})}); const data = await res.json(); if (data.translatedText) setEditingProject(prev => prev ? { ...prev, description_he: (prev.description_he ? prev.description_he + "\n\n" : "") + data.translatedText } : prev); } catch(e) {} }} className="absolute left-2 bottom-2 rounded bg-amber-600/30 px-2 py-1 text-xs text-amber-300 hover:bg-amber-600/50">🔄 Translate to Hebrew</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Address</label>
                  <input name="address" defaultValue={editingProject.address} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Status</label>
                  <select name="status" defaultValue={editingProject.status} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="pre-sale">Pre-sale</option>
                    <option value="under-construction">Under Construction</option>
                    <option value="ready">Ready</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Price Min (₪)</label>
                  <input name="price_min" type="number" defaultValue={editingProject.price_min || ""} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Price Max (₪)</label>
                  <input name="price_max" type="number" defaultValue={editingProject.price_max || ""} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Handover Date</label>
                  <input name="handover_date" type="date" defaultValue={editingProject.handover_date || ""} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Agent</label>
                  <select name="agent_id" defaultValue={editingProject.agent_id || ""} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="">Admin</option>
                    {data?.agents.filter(a => a.email !== "admin@example.com").map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Photo URL</label>
                  <div className="flex gap-2">
                    <input name="photo_url" defaultValue={(JSON.parse(editingProject.photo_urls || "[]") as string[])[0] || ""} className="flex-1 w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="https://..." />
                    <button type="button" onClick={() => editPhotoInputRef.current?.click()} className="shrink-0 rounded-lg bg-amber-600/30 px-3 py-2 text-xs text-amber-300 hover:bg-amber-600/50 whitespace-nowrap">
                      Upload Photo
                    </button>
                  </div>
                  <input ref={editPhotoInputRef} type="file" accept="image/*" className="hidden" onChange={handleEditPhotoUpload} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Website URL</label>
                  <input name="website_url" defaultValue={editingProject.website_url || ""} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="https://..." />
                </div>
              </div>
              {formMsg && <p className="text-sm text-red-400">{formMsg}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setEditingProject(null); setFormMsg("") }} className="rounded-lg bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-500">Cancel</button>
                <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-amber-500">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {editingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-2xl bg-gray-800 p-6 shadow-2xl border border-gray-700">
            <h2 className="mb-4 text-xl font-bold">Edit Agent</h2>
            <form onSubmit={handleUpdateAgent} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Name</label>
                  <input name="name" defaultValue={editingAgent.name} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Company</label>
                  <input name="company" defaultValue={editingAgent.company || ""} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Email</label>
                <input name="email" type="email" defaultValue={editingAgent.email} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">New Password (leave blank to keep)</label>
                  <input name="password" type="password" className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Leave blank to keep" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Phone</label>
                  <input name="phone" defaultValue={editingAgent.phone || ""} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              {formMsg && <p className="text-sm text-red-400">{formMsg}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setEditingAgent(null); setFormMsg("") }} className="rounded-lg bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-500">Cancel</button>
                <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-amber-500">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agent Detail Modal */}
      {viewingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setViewingAgent(null) }}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-gray-900 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{viewingAgent.name}</h2>
              <button onClick={() => { setViewingAgent(null) }} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {/* Agent Info */}
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-900 text-2xl font-bold text-blue-300">
                {viewingAgent.photo_url ? (
                  <img src={viewingAgent.photo_url} alt={viewingAgent.name} className="h-full w-full object-cover" />
                ) : (
                  <span>{viewingAgent.name?.charAt(0) || "?"}</span>
                )}
              </div>
              <div className="text-center sm:text-right">
                <p className="text-lg font-bold text-white">{viewingAgent.name}</p>
                {viewingAgent.company && <p className="text-gray-400">{viewingAgent.company}</p>}
                <div className="mt-2 space-y-1 text-sm text-gray-400">
                  <p>📧 {viewingAgent.email}</p>
                  <p>📞 {viewingAgent.phone || "-"}</p>
                </div>
              </div>
            </div>

            {viewingAgent.description && (
              <div className="mt-4 rounded-xl bg-gray-800 p-4">
                <p className="text-sm text-gray-400">{viewingAgent.description}</p>
              </div>
            )}

            {/* Projects — from existing data */}
            {data && data.projects && (() => {
              const agentProjects = data.projects.filter((p: any) =>
                p.agents && p.agents.some((pa: any) => pa.id === viewingAgent.id)
              );
              if (agentProjects.length === 0) {
                return <div className="mt-6 text-center text-gray-500">No projects assigned</div>;
              }
              return (
                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Projects ({agentProjects.length})</h3>
                  <div className="space-y-2">
                    {agentProjects.map((p: any) => {
                      const leadsCount = data?.leads?.filter((l: any) => l.project_id === p.id).length || 0;
                      return (
                        <div key={p.id} className="flex items-center justify-between rounded-xl bg-gray-800 p-3">
                          <div>
                            <p className="font-medium text-white">{p.name}</p>
                            <p className="text-xs text-gray-500">{p.city} • ₪{Number(p.price_min || 0).toLocaleString()} – ₪{Number(p.price_max || 0).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">{leadsCount} leads</span>
                            <a href={"/projects/" + p.id} target="_blank" className="rounded bg-blue-900 px-2 py-1 text-xs text-blue-300 hover:bg-blue-800">View</a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Blog Post Modal */}
      {showAddBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-2xl rounded-2xl bg-gray-800 p-6 shadow-2xl border border-gray-700" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <h2 className="mb-4 text-xl font-bold">{editingBlog ? "Edit Post" : "New Blog Post"}</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setFormMsg("");
                const fd = new FormData(e.currentTarget);
                const body: Record<string, string> = {};
                fd.forEach((v, k) => { body[k] = v as string });
                if (editingBlog) body.id = editingBlog.id;
                const url = editingBlog ? "/api/admin/blog/update" : "/api/admin/blog/create";
                const res = await fetch(url, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                });
                const json = await res.json();
                if (json.error) {
                  setFormMsg(json.error);
                } else {
                  setShowAddBlog(false);
                  setEditingBlog(null);
                  setFormMsg("");
                  loadData();
                }
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Title *</label>
                  <input name="title" defaultValue={editingBlog?.title || ""} required className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Slug *</label>
                  <input name="slug" defaultValue={editingBlog?.slug || ""} required className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. my-article-slug" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Excerpt / Summary</label>
                <textarea name="excerpt" rows={2} defaultValue={editingBlog?.excerpt || ""} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Content (Hebrew)</label>
                <textarea name="content_he" rows={6} defaultValue={editingBlog?.content_he || ""} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Content (English)</label>
                <textarea name="content_en" rows={6} defaultValue={editingBlog?.content_en || ""} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Image URL</label>
                  <input name="image_url" defaultValue={editingBlog?.image_url || ""} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Published Date (YYYY-MM-DD)</label>
                  <input name="published_at" type="date" defaultValue={editingBlog?.published_at?.split(" ")[0] || ""} className="w-full rounded-lg bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              {formMsg && <p className="text-sm text-red-400">{formMsg}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setShowAddBlog(false); setEditingBlog(null); setFormMsg(""); }} className="rounded-lg bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-500">Cancel</button>
                <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-amber-500">{editingBlog ? "Save Changes" : "Create Post"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}