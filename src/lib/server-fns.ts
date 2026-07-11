import { createServerFn } from "@tanstack/react-start";
import { getDbAsync } from "./db";

export const signupUser = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const body = await ctx.request.json();
  const { name, email, password, company, phone } = body;
  if (!name || !email || !password) return { error: "שם, אימייל וסיסמה נדרשים" };

  const { getAgentByEmail, createAgent, createSession } = await import("./auth");
  const existing = await getAgentByEmail(email);
  if (existing) return { error: "האימייל כבר רשום במערכת" };

  const agent = await createAgent(name, email, password, company || "", phone || "");
  const sessionId = await createSession(agent.id);
  return { success: true, sessionId };
});

export const loginUser = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const body = await ctx.request.json();
  const { email, password } = body;
  if (!email || !password) return { error: "אימייל וסיסמה נדרשים" };

  const { verifyAgentPassword } = await import("./auth");
  const result = await verifyAgentPassword(email, password);
  if (!result) return { error: "אימייל או סיסמה שגויים" };
  return { success: true, sessionId: result.sessionId };
});

export const logoutUser = createServerFn({ method: "POST" }).handler(async () => {
  return { success: true };
});

export const getProjects = createServerFn({ method: "GET" }).handler(async () => {
  const db = await getDbAsync();
  const rows = db.prepare(`SELECT p.*, a.name as agent_name, a.company as agent_company, a.phone as agent_phone, a.email as agent_email
    FROM projects p JOIN agents a ON a.id = p.agent_id
    ORDER BY p.featured DESC, p.created_at DESC LIMIT 50`).all();
  return rows;
});

export const getAgentProjects = createServerFn({ method: "GET" }).handler(async (ctx) => {
  const cookie = ctx.request.headers.get("cookie") || "";
  const sessionMatch = cookie.match(/session=([^;]+)/);
  const sessionId = sessionMatch ? sessionMatch[1] : "";
  const { getAgentFromSession } = await import("./auth");
  const agent = await getAgentFromSession(sessionId);
  if (!agent) return { projects: [], agent: null };

  const db = await getDbAsync();
  const projects = db.prepare("SELECT * FROM projects WHERE agent_id = ? ORDER BY created_at DESC").all(agent.id);
  return { projects, agent };
});

export const saveProject = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const cookie = ctx.request.headers.get("cookie") || "";
  const sessionMatch = cookie.match(/session=([^;]+)/);
  const sessionId = sessionMatch ? sessionMatch[1] : "";
  const { getAgentFromSession } = await import("./auth");
  const agent = await getAgentFromSession(sessionId);
  if (!agent) return { error: "לא מחובר" };

  const body = await ctx.request.json();
  const { id, name, description, city, address, lat, lng, propertyTypes, priceMin, priceMax, unitCount, handoverDate, status, photoUrls, floorPlanUrls } = body;
  if (!name || !city) return { error: "שם ועיר נדרשים" };

  const { v4: uuid } = await import("uuid");
  const db = await getDbAsync();
  const projectId = id || uuid();

  if (id) {
    db.prepare(`UPDATE projects SET name=?, description=?, city=?, address=?, lat=?, lng=?, property_types=?, price_min=?, price_max=?, unit_count=?, handover_date=?, status=?, photo_urls=?, floor_plan_urls=?, updated_at=datetime('now') WHERE id=? AND agent_id=?`).run(
      name, description || "", city, address || "", lat || 0, lng || 0, JSON.stringify(propertyTypes || []), priceMin || 0, priceMax || 0, unitCount || 0, handoverDate || null, status || "pre-sale", JSON.stringify(photoUrls || []), JSON.stringify(floorPlanUrls || []), projectId, agent.id
    );
  } else {
    db.prepare(`INSERT INTO projects (id, agent_id, name, description, city, address, lat, lng, property_types, price_min, price_max, unit_count, handover_date, status, photo_urls, floor_plan_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      projectId, agent.id, name, description || "", city, address || "", lat || 0, lng || 0, JSON.stringify(propertyTypes || []), priceMin || 0, priceMax || 0, unitCount || 0, handoverDate || null, status || "pre-sale", JSON.stringify(photoUrls || []), JSON.stringify(floorPlanUrls || [])
    );
  }
  return { success: true, id: projectId };
});

export const deleteProject = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const cookie = ctx.request.headers.get("cookie") || "";
  const sessionMatch = cookie.match(/session=([^;]+)/);
  const sessionId = sessionMatch ? sessionMatch[1] : "";
  const { getAgentFromSession } = await import("./auth");
  const agent = await getAgentFromSession(sessionId);
  if (!agent) return { error: "לא מחובר" };

  const body = await ctx.request.json();
  const { id } = body;
  const db = await getDbAsync();
  db.prepare("DELETE FROM projects WHERE id=? AND agent_id=?").run(id, agent.id);
  return { success: true };
});

export const getLeads = createServerFn({ method: "GET" }).handler(async (ctx) => {
  const cookie = ctx.request.headers.get("cookie") || "";
  const sessionMatch = cookie.match(/session=([^;]+)/);
  const sessionId = sessionMatch ? sessionMatch[1] : "";
  const { getAgentFromSession } = await import("./auth");
  const agent = await getAgentFromSession(sessionId);
  if (!agent) return { leads: [] };

  const url = new URL(ctx.request.url);
  const projectId = url.searchParams.get("projectId");
  if (!projectId) return { leads: [] };

  const db = await getDbAsync();
  const project = db.prepare("SELECT id FROM projects WHERE id = ? AND agent_id = ?").get(projectId, agent.id);
  if (!project) return { leads: [] };

  const leads = db.prepare("SELECT * FROM leads WHERE project_id = ? ORDER BY created_at DESC").all(projectId);
  return { leads };
});

export const submitLead = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const body = await ctx.request.json();
  const { projectId, name, phone, email, message } = body;
  if (!name || !phone) return { error: "שם וטלפון נדרשים" };

  const { v4: uuid } = await import("uuid");
  const db = await getDbAsync();
  const project = db.prepare("SELECT id FROM projects WHERE id = ?").get(projectId);
  if (!project) return { error: "הפרויקט לא נמצא" };

  db.prepare("INSERT INTO leads (id, project_id, name, phone, email, message) VALUES (?, ?, ?, ?, ?, ?)").run(uuid(), projectId, name, phone, email || "", message || "");
  return { success: true };
});