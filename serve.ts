import handler from "./dist/server/server.js";
import { Database } from "bun:sqlite";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import path from "node:path";
import fs from "node:fs";


const PORT = 3000;
const HOST = "0.0.0.0";
const CLIENT_DIR = `${import.meta.dir}/dist/client`;
const PUBLIC_DIR = path.resolve(process.cwd(), "public");


const dbDir = path.resolve(process.cwd(), "data");
const dbPath = path.resolve(dbDir, "newbuild.db");
fs.mkdirSync(dbDir, { recursive: true });

let _db: Database | null = null;
function getDb(): Database {
  if (_db) return _db;
  _db = new Database(dbPath);
  _db.exec("PRAGMA journal_mode = WAL");
  _db.exec("PRAGMA foreign_keys = ON");
  _db.exec(`CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, company TEXT NOT NULL DEFAULT '',
    email TEXT UNIQUE NOT NULL, phone TEXT NOT NULL DEFAULT '',
    password TEXT NOT NULL, photo_url TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  _db.exec(`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY, agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  _db.exec(`CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', city TEXT NOT NULL,
    address TEXT NOT NULL DEFAULT '', lat REAL NOT NULL DEFAULT 0, lng REAL NOT NULL DEFAULT 0,
    property_types TEXT NOT NULL DEFAULT '[]', price_min INTEGER NOT NULL DEFAULT 0,
    price_max INTEGER NOT NULL DEFAULT 0, unit_count INTEGER NOT NULL DEFAULT 0,
    handover_date TEXT, status TEXT NOT NULL DEFAULT 'pre-sale',
    photo_urls TEXT NOT NULL DEFAULT '[]', floor_plan_urls TEXT NOT NULL DEFAULT '[]',
    website_url TEXT NOT NULL DEFAULT '',
    featured INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  _db.exec(`CREATE TABLE IF NOT EXISTS project_agents (
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, agent_id)
  )`);
  _db.exec(`CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
    name TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  try { _db.exec("ALTER TABLE projects ADD COLUMN website_url TEXT NOT NULL DEFAULT ''"); } catch (e) {}
  try { _db.exec("ALTER TABLE leads ADD COLUMN notified INTEGER NOT NULL DEFAULT 0"); } catch (e) {}
  try { _db.exec("ALTER TABLE leads ADD COLUMN seen INTEGER NOT NULL DEFAULT 0"); } catch (e) {}
  try { _db.exec("ALTER TABLE agents ADD COLUMN description TEXT NOT NULL DEFAULT ''"); } catch (e) {}
  try { _db.exec("ALTER TABLE leads ADD COLUMN status TEXT NOT NULL DEFAULT 'new'"); } catch (e) {}
  try { _db.exec("ALTER TABLE leads ADD COLUMN assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL"); } catch (e) {}
  try {
    _db.exec(`CREATE TABLE IF NOT EXISTS project_agents (
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      PRIMARY KEY (project_id, agent_id)
    )`);
    _db.exec("INSERT OR IGNORE INTO project_agents (project_id, agent_id) SELECT id, agent_id FROM projects WHERE agent_id IS NOT NULL AND agent_id != ''");
  } catch (e) {}
  try { _db.exec("ALTER TABLE projects DROP COLUMN agent_id"); } catch (e) {}

  const adminExists = _db.prepare("SELECT id FROM agents WHERE email = 'chaim@bienenfeld.org'").get();
  if (!adminExists) {
    const adminId = "admin-001";
    const adminPw = bcrypt.hashSync("admin123", 10);
    _db.prepare("INSERT INTO agents (id, name, company, email, phone, password, description) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(adminId, "Admin", "MLS Israel", "chaim@bienenfeld.org", "0587011221", adminPw, "מנהל המערכת");
  }

  const demoAgentExists = _db.prepare("SELECT id FROM agents WHERE email = 'demo@example.com'").get();
  if (!demoAgentExists) {
    const demoId = "demo-agent-001";
    _db.prepare("INSERT INTO agents (id, name, company, email, phone, password, description) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(demoId, "ישראל ישראלי", "יזמות ובנייה בע״מ", "demo@example.com", "03-5555555", bcrypt.hashSync("demo123", 10), "סוכן נדל״ן מנוסה עם 15 שנות ניסיון בליווי רוכשים בפרויקטים חדשים ברחבי הארץ.");

    const demoProjects = [
      { name: "מגדל היובל", city: "תל אביב", address: "רחוב היובל 15", types: ["דירה", "דופלקס"], priceMin: 2500000, priceMax: 5800000, units: 120, handover: "רבעון 3 2026", status: "under-construction", desc: "מגדל יוקרתי בן 35 קומות בלב תל אביב. דירות נוף לים, גג פנטהאוז, בריכה וחדר כושר.", featured: 1, website: "https://migdal-hayovel.co.il" },
      { name: "נופי כרמל", city: "חיפה", address: "דרך הים 8", types: ["דירה", "בית"], priceMin: 1800000, priceMax: 3500000, units: 85, handover: "רבעון 1 2027", status: "pre-sale", desc: "שכונת יוקרה על מורדות הכרמל עם נוף פנורמי למפרץ. גינות פרטיות וחניה תת קרקעית.", featured: 1, website: "https://nof-carmel.co.il" },
    ];

    for (const p of demoProjects) {
      const projectId = uuid();
      _db.prepare(`INSERT INTO projects (id, name, description, city, address, property_types, price_min, price_max, unit_count, handover_date, status, featured, website_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(projectId, p.name, p.desc, p.city, p.address, JSON.stringify(p.types), p.priceMin, p.priceMax, p.units, p.handover, p.status, p.featured, p.website);
      _db.prepare("INSERT INTO project_agents (project_id, agent_id) VALUES (?, ?)").run(projectId, demoId);
    }
  }
  return _db;
}

function getSessionAgent(sessionId: string): any {
  if (!sessionId) return null;
  const db = getDb();
  return db.prepare(
    "SELECT a.id, a.name, a.company, a.email, a.phone, a.photo_url, a.description FROM sessions s JOIN agents a ON a.id = s.agent_id WHERE s.id = ?"
  ).get(sessionId) || null;
}

function getProjectAgents(projectId: string): any[] {
  return getDb().prepare(
    "SELECT a.id, a.name, a.company, a.email, a.phone, a.photo_url, a.description FROM project_agents pa JOIN agents a ON a.id = pa.agent_id WHERE pa.project_id = ?"
  ).all(projectId);
}

async function apiHandler(req: Request): Promise<Response | null> {
  const { pathname } = new URL(req.url);

  // Auth: Signup
  if (pathname === "/api/auth/signup" && req.method === "POST") {
    const body = await req.json();
    const { name, email, password, company, phone, description } = body;
    if (!name || !email || !password) {
      return Response.json({ error: "שם, אימייל וסיסמה נדרשים" }, { status: 400 });
    }
    const db = getDb();
    const existing = db.prepare("SELECT id FROM agents WHERE email = ?").get(email);
    if (existing) {
      return Response.json({ error: "האימייל כבר רשום במערכת" }, { status: 400 });
    }
    const id = uuid();
    const pw = bcrypt.hashSync(password, 10);
    db.prepare("INSERT INTO agents (id, name, company, email, phone, password, description) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(id, name, company || "", email, phone || "", pw, description || "");
    const sessionId = uuid();
    db.prepare("INSERT INTO sessions (id, agent_id) VALUES (?, ?)").run(sessionId, id);
    return Response.json(
      { success: true },
      { headers: { "Set-Cookie": `session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800` } }
    );
  }

  // Auth: Login
  if (pathname === "/api/auth/login" && req.method === "POST") {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password) {
      return Response.json({ error: "אימייל וסיסמה נדרשים" }, { status: 400 });
    }
    const db = getDb();
    const agent = db.prepare("SELECT * FROM agents WHERE email = ?").get(email) as any;
    if (!agent || !bcrypt.compareSync(password, agent.password)) {
      return Response.json({ error: "אימייל או סיסמה שגויים" }, { status: 401 });
    }
    const sessionId = uuid();
    db.prepare("INSERT INTO sessions (id, agent_id) VALUES (?, ?)").run(sessionId, agent.id);
    return Response.json(
      { success: true },
      { headers: { "Set-Cookie": `session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800` } }
    );
  }

  // Auth: Logout
  if (pathname === "/api/auth/logout" && req.method === "POST") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    if (match) {
      getDb().prepare("DELETE FROM sessions WHERE id = ?").run(match[1]);
    }
    return Response.json(
      { success: true },
      { headers: { "Set-Cookie": "session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0" } }
    );
  }

  // Public: List all projects (for homepage) with agents
  if (pathname === "/api/public/projects" && req.method === "GET") {
    const db = getDb();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (id) {
      const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as any;
      if (!project) return Response.json({ error: "Not found" }, { status: 404 });
      project.agents = getProjectAgents(project.id);
      return Response.json({ project });
    }
    const projects = db.prepare("SELECT * FROM projects ORDER BY featured DESC, created_at DESC").all();
    const result = (projects as any[]).map(p => ({
      ...p,
      agents: getProjectAgents(p.id),
    }));
    return Response.json({ projects: result });
  }

  // Public: Get agent details with their projects
  if (pathname.startsWith("/api/public/agents/") && req.method === "GET") {
    const agentId = pathname.replace("/api/public/agents/", "");
    if (!agentId) return Response.json({ error: "Agent ID required" }, { status: 400 });
    const db = getDb();
    const agent = db.prepare("SELECT id, name, company, email, phone, photo_url, description, created_at FROM agents WHERE id = ?").get(agentId) as any;
    if (!agent) return Response.json({ error: "Not found" }, { status: 404 });
    const projects = db.prepare(`
      SELECT p.* FROM projects p JOIN project_agents pa ON pa.project_id = p.id
      WHERE pa.agent_id = ? ORDER BY p.created_at DESC
    `).all(agentId);
    return Response.json({ agent, projects });
  }

  // Agent's projects
  if (pathname === "/api/projects" && req.method === "GET") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const agent = match ? getSessionAgent(match[1]) : null;
    if (!agent) return Response.json({ projects: [], agent: null });
    const db = getDb();
    const projects = db.prepare(`
      SELECT p.*, (SELECT COUNT(*) FROM leads WHERE project_id = p.id) as total_leads,
             (SELECT COUNT(*) FROM leads WHERE project_id = p.id AND seen = 0) as new_leads
      FROM projects p JOIN project_agents pa ON pa.project_id = p.id
      WHERE pa.agent_id = ? ORDER BY p.created_at DESC
    `).all(agent.id);
    const result = (projects as any[]).map(p => ({
      ...p,
      agents: getProjectAgents(p.id),
    }));
    return Response.json({ projects: result, agent });
  }

  // Projects: Create/Update (agent's own)
  if (pathname === "/api/projects" && req.method === "POST") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const agent = match ? getSessionAgent(match[1]) : null;
    if (!agent) return Response.json({ error: "לא מחובר" }, { status: 401 });

    const body = await req.json();
    const { id, name, description, city, address, lat, lng, propertyTypes, priceMin, priceMax, unitCount, handoverDate, status, photoUrls, floorPlanUrls, websiteUrl } = body;
    if (!name || !city) return Response.json({ error: "שם ועיר נדרשים" }, { status: 400 });

    const db = getDb();
    if (id) {
      // Check user is assigned to this project
      const rel = db.prepare("SELECT * FROM project_agents WHERE project_id = ? AND agent_id = ?").get(id, agent.id);
      if (!rel) return Response.json({ error: "Unauthorized" }, { status: 403 });
      db.prepare(`UPDATE projects SET name=?, description=?, city=?, address=?, lat=?, lng=?, property_types=?, price_min=?, price_max=?, unit_count=?, handover_date=?, status=?, photo_urls=?, floor_plan_urls=?, website_url=?, updated_at=datetime('now') WHERE id=?`)
        .run(name, description || "", city, address || "", lat || 0, lng || 0, JSON.stringify(propertyTypes || []), priceMin || 0, priceMax || 0, unitCount || 0, handoverDate || null, status || "pre-sale", JSON.stringify(photoUrls || []), JSON.stringify(floorPlanUrls || []), websiteUrl || "", id);
      return Response.json({ success: true, id });
    } else {
      // Check for duplicate project by name + city
      const existing = db.prepare("SELECT id FROM projects WHERE name = ? AND city = ?").get(name, city) as any;
      if (existing) {
        // Project exists - add agent to it
        db.prepare("INSERT OR IGNORE INTO project_agents (project_id, agent_id) VALUES (?, ?)").run(existing.id, agent.id);
        return Response.json({ success: true, id: existing.id, added: true });
      }
      const projectId = uuid();
      db.prepare(`INSERT INTO projects (id, name, description, city, address, lat, lng, property_types, price_min, price_max, unit_count, handover_date, status, photo_urls, floor_plan_urls, website_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(projectId, name, description || "", city, address || "", lat || 0, lng || 0, JSON.stringify(propertyTypes || []), priceMin || 0, priceMax || 0, unitCount || 0, handoverDate || null, status || "pre-sale", JSON.stringify(photoUrls || []), JSON.stringify(floorPlanUrls || []), websiteUrl || "");
      db.prepare("INSERT INTO project_agents (project_id, agent_id) VALUES (?, ?)").run(projectId, agent.id);
      return Response.json({ success: true, id: projectId });
    }
  }

  // Projects: Delete
  if (pathname === "/api/projects" && req.method === "DELETE") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const agent = match ? getSessionAgent(match[1]) : null;
    if (!agent) return Response.json({ error: "לא מחובר" }, { status: 401 });
    const url = new URL(req.url);
    const projectId = url.searchParams.get("id");
    if (!projectId) return Response.json({ error: "מזהה פרויקט נדרש" }, { status: 400 });
    const db = getDb();
    const rel = db.prepare("SELECT * FROM project_agents WHERE project_id = ? AND agent_id = ?").get(projectId, agent.id);
    if (!rel) return Response.json({ error: "Unauthorized" }, { status: 403 });
    db.prepare("DELETE FROM project_agents WHERE project_id = ? AND agent_id = ?").run(projectId, agent.id);
    // If no more agents, delete the project
    const remaining = db.prepare("SELECT COUNT(*) as cnt FROM project_agents WHERE project_id = ?").get(projectId) as any;
    if (remaining.cnt === 0) {
      db.prepare("DELETE FROM projects WHERE id = ?").run(projectId);
    }
    return Response.json({ success: true });
  }

  // Leads: List (agent's own projects)
  if (pathname === "/api/leads" && req.method === "GET") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const agent = match ? getSessionAgent(match[1]) : null;
    if (!agent) return Response.json({ leads: [] });
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) return Response.json({ leads: [] });
    const db = getDb();
    const rel = db.prepare("SELECT * FROM project_agents WHERE project_id = ? AND agent_id = ?").get(projectId, agent.id);
    if (!rel) return Response.json({ leads: [] });
    const leads = db.prepare("SELECT l.*, a.name as assigned_agent_name FROM leads l LEFT JOIN agents a ON a.id = l.assigned_agent_id WHERE l.project_id = ? ORDER BY l.created_at DESC").all(projectId);
    db.prepare("UPDATE leads SET seen = 1 WHERE project_id = ? AND seen = 0").run(projectId);
    return Response.json({ leads });
  }

  // Leads: Submit
  if (pathname === "/api/leads" && req.method === "POST") {
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) return Response.json({ error: "מזהה פרויקט חסר" }, { status: 400 });

    const body = await req.json();
    const { name: leadName, phone: leadPhone, email: leadEmail, message: leadMessage, agentId } = body;
    if (!leadName || !leadPhone) return Response.json({ error: "שם וטלפון נדרשים" }, { status: 400 });

    const db = getDb();
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(projectId) as any;
    if (!project) return Response.json({ error: "הפרויקט לא נמצא" }, { status: 404 });

    const assignedAgentId = agentId || null;

    const leadId = uuid();
    db.prepare("INSERT INTO leads (id, project_id, assigned_agent_id, name, phone, email, message) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(leadId, projectId, assignedAgentId, leadName, leadPhone, leadEmail || "", leadMessage || "");

    // Send email notification to assigned agent via Resend
    let notified = 0;
    if (assignedAgentId) {
      const assignedAgent = db.prepare("SELECT * FROM agents WHERE id = ?").get(assignedAgentId) as any;
      // Skip notification for placeholder emails (demo/test agents)
      if (assignedAgent && assignedAgent.email && !assignedAgent.email.includes('example.com') && !assignedAgent.email.includes('test')) {
        try {
          const emailRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": "Bearer re_MHqhpdcD_F3EzDK5oso9DAEhHKuEVStZr",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "MLS Israel <onboarding@resend.dev>",
              to: [assignedAgent.email],
              subject: "New Lead Inquiry - " + project.name,
              html: "<h2>New Lead Inquiry</h2>" +
                "<p>Hi <strong>" + assignedAgent.name + "</strong>,</p>" +
                "<p>You have received a new lead inquiry for <strong>" + project.name + "</strong> in " + (project.city || "") + ".</p>" +
                "<table style='border-collapse:collapse;width:100%'>" +
                "<tr><td style='padding:8px;border:1px solid #ddd;font-weight:bold'>From</td><td style='padding:8px;border:1px solid #ddd'>" + (leadName || "N/A") + "</td></tr>" +
                "<tr><td style='padding:8px;border:1px solid #ddd;font-weight:bold'>Phone</td><td style='padding:8px;border:1px solid #ddd'>" + (leadPhone || "N/A") + "</td></tr>" +
                "<tr><td style='padding:8px;border:1px solid #ddd;font-weight:bold'>Email</td><td style='padding:8px;border:1px solid #ddd'>" + (leadEmail || "N/A") + "</td></tr>" +
                "<tr><td style='padding:8px;border:1px solid #ddd;font-weight:bold'>Message</td><td style='padding:8px;border:1px solid #ddd'>" + (leadMessage || "N/A") + "</td></tr>" +
                "</table>" +
                "<p>Please follow up at your earliest convenience.</p>" +
                "<p>Best,<br>MLS Israel Team<br><a href='https://mls-israel.ctonew.app'>https://mls-israel.ctonew.app</a></p>",
            }),
          });
          if (emailRes.ok) notified = 1;
        } catch (e: any) {
          console.error("Failed to send email notification:", e.message);
        }
      }
    }
    db.prepare("UPDATE leads SET notified = ? WHERE id = ?").run(notified, leadId);
    console.log("New lead saved:", leadName, "for project:", project.name, "assigned to:", assignedAgentId || "none", "- notified:", notified === 1);

    const agents = getProjectAgents(projectId);
    return Response.json({ success: true, lead: { name: leadName, phone: leadPhone, email: leadEmail, message: leadMessage, projectName: project.name, agents } });
  }

  // Internal: Get pending email notifications (notified=0)
  if (pathname === "/api/pending-notifications" && req.method === "GET") {
    const db = getDb();
    const leads = db.prepare(
      "SELECT l.id as lead_id, l.name as lead_name, l.phone as lead_phone, l.email as lead_email, l.message as lead_message, " +
      "l.created_at, p.name as project_name, p.city as project_city, " +
      "a.id as agent_id, a.name as agent_name, a.email as agent_email, a.company as agent_company " +
      "FROM leads l JOIN projects p ON p.id = l.project_id " +
      "LEFT JOIN agents a ON a.id = l.assigned_agent_id " +
      "WHERE l.notified = 0 ORDER BY l.created_at ASC"
    ).all();
    return Response.json({ leads });
  }
  // Internal: Mark notification as sent
  if (pathname === "/api/mark-notified" && req.method === "POST") {
    const body = await req.json();
    const { leadId } = body;
    if (!leadId) return Response.json({ error: "leadId required" }, { status: 400 });
    const db = getDb();
    db.prepare("UPDATE leads SET notified = 1 WHERE id = ?").run(leadId);
    return Response.json({ success: true });
  }
  // Leads: Update status
  if (pathname === "/api/leads/status" && req.method === "POST") {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) return Response.json({ error: "Lead ID and status required" }, { status: 400 });
    if (!["new", "contacted", "in_progress", "completed"].includes(status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }
    getDb().prepare("UPDATE leads SET status = ? WHERE id = ?").run(status, id);
    return Response.json({ success: true });
  }

  // Leads: Delete
  if (pathname === "/api/leads/delete" && req.method === "POST") {
    const body = await req.json();
    if (!body.id) return Response.json({ error: "Lead ID required" }, { status: 400 });
    getDb().prepare("DELETE FROM leads WHERE id = ?").run(body.id);
    return Response.json({ success: true });
  }

  // Admin: Login
  if (pathname === "/api/admin/login" && req.method === "POST") {
    const body = await req.json();
    const { email, password } = body;
    if (email === "chaim@bienenfeld.org" && password === "admin123") {
      const db = getDb();
      const agent = db.prepare("SELECT * FROM agents WHERE email = ?").get(email) as any;
      if (agent && bcrypt.compareSync(password, agent.password)) {
        const sessionId = uuid();
        db.prepare("INSERT INTO sessions (id, agent_id) VALUES (?, ?)").run(sessionId, agent.id);
        return Response.json(
          { success: true },
          { headers: { "Set-Cookie": `session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800` } }
        );
      }
    }
    return Response.json({ error: "אימייל או סיסמה שגויים" }, { status: 401 });
  }

  // Admin: Dashboard
  if (pathname === "/api/admin/dashboard" && req.method === "GET") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const agent = match ? getSessionAgent(match[1]) : null;
    if (!agent || agent.email !== "chaim@bienenfeld.org") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = getDb();
    const projects = db.prepare("SELECT * FROM projects ORDER BY created_at DESC").all();
    const projectsWithAgents = (projects as any[]).map(p => ({ ...p, agents: getProjectAgents(p.id) }));
    const agentsList = db.prepare("SELECT id, name, company, email, phone, photo_url, description, created_at FROM agents ORDER BY created_at DESC").all();
    const leads = db.prepare("SELECT l.*, p.name as project_name, a.name as assigned_agent_name FROM leads l JOIN projects p ON p.id = l.project_id LEFT JOIN agents a ON a.id = l.assigned_agent_id ORDER BY l.created_at DESC LIMIT 100").all();
    return Response.json({ projects: projectsWithAgents, agents: agentsList, leads });
  }

  // Admin: Delete project
  if (pathname === "/api/admin/projects/delete" && req.method === "POST") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const agent = match ? getSessionAgent(match[1]) : null;
    if (!agent || agent.email !== "chaim@bienenfeld.org") return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    getDb().prepare("DELETE FROM projects WHERE id = ?").run(body.id);
    return Response.json({ success: true });
  }

  // Admin: Delete agent
  if (pathname === "/api/admin/agents/delete" && req.method === "POST") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const agent = match ? getSessionAgent(match[1]) : null;
    if (!agent || agent.email !== "chaim@bienenfeld.org") return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    getDb().prepare("DELETE FROM agents WHERE id = ? AND email != 'chaim@bienenfeld.org'").run(body.id);
    return Response.json({ success: true });
  }

  // Admin: Toggle featured
  if (pathname === "/api/admin/projects/featured" && req.method === "POST") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const agent = match ? getSessionAgent(match[1]) : null;
    if (!agent || agent.email !== "chaim@bienenfeld.org") return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const project = getDb().prepare("SELECT featured FROM projects WHERE id = ?").get(body.id) as any;
    if (!project) return Response.json({ error: "Not found" }, { status: 404 });
    const newVal = project.featured ? 0 : 1;
    getDb().prepare("UPDATE projects SET featured = ? WHERE id = ?").run(newVal, body.id);
    return Response.json({ success: true, featured: !!newVal });
  }

  // Admin: Create project (with duplicate check)
  if (pathname === "/api/admin/projects/create" && req.method === "POST") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const agent = match ? getSessionAgent(match[1]) : null;
    if (!agent || agent.email !== "chaim@bienenfeld.org") return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { name, description, city, address, price_min, price_max, status, handover_date, photo_url, website_url, agent_id } = body;
    if (!name || !city) return Response.json({ error: "Name and city are required" }, { status: 400 });
    const db = getDb();
    // Check duplicate
    const existing = db.prepare("SELECT id FROM projects WHERE name = ? AND city = ?").get(name, city) as any;
    if (existing) {
      if (agent_id) db.prepare("INSERT OR IGNORE INTO project_agents (project_id, agent_id) VALUES (?, ?)").run(existing.id, agent_id);
      return Response.json({ success: true, id: existing.id, added: true });
    }
    const id = uuid();
    const photoUrlsJson = photo_url ? JSON.stringify([photo_url]) : "[]";
    db.prepare("INSERT INTO projects (id, name, description, city, address, price_min, price_max, status, handover_date, photo_urls, website_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, name, description || "", city, address || "", price_min ? parseInt(price_min) : 0, price_max ? parseInt(price_max) : 0, status || "pre-sale", handover_date || "", photoUrlsJson, website_url || "");
    const targetAgentId = agent_id || agent.id;
    db.prepare("INSERT INTO project_agents (project_id, agent_id) VALUES (?, ?)").run(id, targetAgentId);
    return Response.json({ success: true, id });
  }

  // Admin: Create agent
  if (pathname === "/api/admin/agents/create" && req.method === "POST") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const admin = match ? getSessionAgent(match[1]) : null;
    if (!admin || admin.email !== "chaim@bienenfeld.org") return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { name, email, password, company, phone, description } = body;
    if (!name || !email || !password) return Response.json({ error: "Name, email, and password are required" }, { status: 400 });
    const db = getDb();
    const existing = db.prepare("SELECT id FROM agents WHERE email = ?").get(email);
    if (existing) return Response.json({ error: "Email already registered" }, { status: 400 });
    const id = uuid();
    const pw = bcrypt.hashSync(password, 10);
    db.prepare("INSERT INTO agents (id, name, company, email, phone, password, description) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(id, name, company || "", email, phone || "", pw, description || "");
    return Response.json({ success: true, id });
  }

  // Admin: Update project
  if (pathname === "/api/admin/projects/update" && req.method === "POST") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const agent = match ? getSessionAgent(match[1]) : null;
    if (!agent || agent.email !== "chaim@bienenfeld.org") return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { id, name, description, city, address, price_min, price_max, status, handover_date, photo_url, website_url } = body;
    if (!id) return Response.json({ error: "Project ID is required" }, { status: 400 });
    const db = getDb();
    if (!db.prepare("SELECT id FROM projects WHERE id = ?").get(id)) return Response.json({ error: "Not found" }, { status: 404 });
    const photoUrlsJson = photo_url ? JSON.stringify([photo_url]) : undefined;
    db.prepare(`UPDATE projects SET name = COALESCE(?, name), description = COALESCE(?, description), city = COALESCE(?, city), address = COALESCE(?, address), price_min = COALESCE(?, price_min), price_max = COALESCE(?, price_max), status = COALESCE(?, status), handover_date = COALESCE(?, handover_date), photo_urls = COALESCE(?, photo_urls), website_url = COALESCE(?, website_url), updated_at = datetime('now') WHERE id = ?`)
      .run(name || null, description || null, city || null, address || null, price_min ? parseInt(price_min) : null, price_max ? parseInt(price_max) : null, status || null, handover_date || null, photoUrlsJson || null, website_url || null, id);
    return Response.json({ success: true });
  }

  // Admin: Update agent
  if (pathname === "/api/admin/agents/update" && req.method === "POST") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const admin = match ? getSessionAgent(match[1]) : null;
    if (!admin || admin.email !== "chaim@bienenfeld.org") return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { id, name, email, password, company, phone, description } = body;
    if (!id) return Response.json({ error: "Agent ID is required" }, { status: 400 });
    const db = getDb();
    if (!db.prepare("SELECT id FROM agents WHERE id = ?").get(id)) return Response.json({ error: "Not found" }, { status: 404 });
    if (email) {
      const dup = db.prepare("SELECT id FROM agents WHERE email = ? AND id != ?").get(email, id);
      if (dup) return Response.json({ error: "Email already in use" }, { status: 400 });
    }
    let pwClause = "";
    const params: any[] = [];
    if (password) { pwClause = ", password = ?"; params.push(bcrypt.hashSync(password, 10)); }
    params.push(id);
    db.prepare(`UPDATE agents SET name = COALESCE(?, name), email = COALESCE(?, email), company = COALESCE(?, company), phone = COALESCE(?, phone), description = COALESCE(?, description)${pwClause} WHERE id = ?`)
      .run(name || null, email || null, company || null, phone || null, description || null, ...params);
    return Response.json({ success: true });
  }

  // Agent: Update own profile
  if (pathname === "/api/agent/profile" && req.method === "POST") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const agent = match ? getSessionAgent(match[1]) : null;
    if (!agent) return Response.json({ error: "לא מחובר" }, { status: 401 });
    const body = await req.json();
    const { name, company, phone, description, email } = body;
    const db = getDb();
    if (email && email !== agent.email) {
      const dup = db.prepare("SELECT id FROM agents WHERE email = ? AND id != ?").get(email, agent.id);
      if (dup) return Response.json({ error: "האימייל כבר בשימוש" }, { status: 400 });
    }
    db.prepare("UPDATE agents SET name = COALESCE(?, name), company = COALESCE(?, company), phone = COALESCE(?, phone), description = COALESCE(?, description), email = COALESCE(?, email) WHERE id = ?")
      .run(name || null, company || null, phone || null, description || null, email || null, agent.id);
    return Response.json({ success: true });
  }

  // Agent: Upload profile photo
  if (pathname === "/api/agent/photo" && req.method === "POST") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const agent = match ? getSessionAgent(match[1]) : null;
    if (!agent) return Response.json({ error: "לא מחובר" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("photo") as File | null;
    if (!file) return Response.json({ error: "קובץ תמונה נדרש" }, { status: 400 });

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: "סוג קובץ לא נתמך. יש להעלות JPEG, PNG, WebP או GIF" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return Response.json({ error: "הקובץ גדול מדי. גודל מקסימלי 5MB" }, { status: 400 });
    }

    const uploadsDir = path.resolve(process.cwd(), "public", "uploads", "avatars");
    fs.mkdirSync(uploadsDir, { recursive: true });

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${agent.id}-${Date.now()}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    const photoUrl = `/uploads/avatars/${filename}`;

    // Update the agent's photo_url in the database
    const db = getDb();
    db.prepare("UPDATE agents SET photo_url = ? WHERE id = ?").run(photoUrl, agent.id);

    return Response.json({ success: true, photo_url: photoUrl });
  }

  return null;
}

const freePort = `for _ in $(seq 1 25); do pids=$(lsof -t -iTCP:${String(PORT)} -sTCP:LISTEN 2>/dev/null || true); if [ -z "$pids" ]; then exit 0; fi; kill $pids 2>/dev/null || true; sleep 0.2; done`;

for (let attempt = 1; ; attempt++) {
  await Bun.$`sudo sh -c ${freePort}`.quiet().nothrow();
  try {
    Bun.serve({
      port: PORT,
      hostname: HOST,
      async fetch(req) {
        const apiResp = await apiHandler(req);
        if (apiResp) return apiResp;
        const { pathname } = new URL(req.url);
        // Try public directory first (for uploaded files)
        if (pathname !== "/") {
          const publicFile = Bun.file(PUBLIC_DIR + pathname);
          if (await publicFile.exists()) return new Response(publicFile);
          const file = Bun.file(CLIENT_DIR + pathname);
          if (await file.exists()) return new Response(file);
        }
        return (handler as { fetch: (r: Request) => Response | Promise<Response> }).fetch(req);
      },
    });
    break;
  } catch (err) {
    if (attempt >= 10) throw err;
    await Bun.sleep(200);
  }
}

console.log(`team-site serving on http://${HOST}:${String(PORT)}`);
