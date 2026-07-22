import handler from "./dist/server/server.js";
import bcrypt from "bcryptjs";
import { getDbAsync } from "./src/lib/db";
import { v4 as uuid } from "uuid";
import path from "node:path";
import fs from "node:fs";

const PORT = 3000;
const HOST = "0.0.0.0";
const CLIENT_DIR = `${import.meta.dir}/dist/client`;
const PUBLIC_DIR = path.resolve(process.cwd(), "public");


fs.mkdirSync(path.resolve(process.cwd(), "data"), { recursive: true });

let _db: any = null;
async function getDb() {
  if (_db) return _db;
  _db = await getDbAsync();
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
  try { _db.exec("ALTER TABLE projects ADD COLUMN description_he TEXT NOT NULL DEFAULT ''"); } catch (e) {}
  try { _db.exec("ALTER TABLE projects ADD COLUMN description_en TEXT NOT NULL DEFAULT ''"); } catch (e) {}
  try { _db.exec("CREATE TABLE IF NOT EXISTS blog_posts (id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, excerpt TEXT NOT NULL DEFAULT '', content_he TEXT NOT NULL DEFAULT '', content_en TEXT NOT NULL DEFAULT '', image_url TEXT NOT NULL DEFAULT '', published_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))"); } catch (e) {}
  try { _db.exec("CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug)"); } catch (e) {}
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

  // Seed blog posts
  const blogCount = _db.prepare("SELECT COUNT(*) as cnt FROM blog_posts").get() as any;
  if (blogCount.cnt === 0) {
    const posts = [
      {
        slug: "how-to-buy-a-new-apartment-in-israel",
        title: "איך לקנות דירה חדשה בישראל",
        excerpt: "מדריך מקיף לרכישת דירה חדשה מקבלן בישראל — משלב החיפוש ועד קבלת המפתחות.",
        content_he: `<h2>שלב 1: הגדרת תקציב</h2><p>לפני שמתחילים לחפש דירה, חשוב להגדיר תקציב ריאלי. קחו בחשבון את המחיר הכולל כולל מע"מ, הוצאות רכישה, ושכר טרחת עורך דין.</p><h2>שלב 2: חיפוש פרויקטים</h2><p>השתמשו בפלטפורמה שלנו כדי למצוא פרויקטים חדשים בכל הארץ. סננו לפי עיר, טווח מחירים וסוג נכס.</p><h2>שלב 3: ביקור בפרויקט</h2><p>קבעו פגישה עם נציג המכירות ובקרו בפרויקט. בדקו את איכות הבנייה, המיקום, והתשתיות בסביבה.</p><h2>שלב 4: חתימת חוזה</h2><p>לאחר שבחרתם דירה, חתמו על חוזה רכישה. מומלץ לערב עורך דין המתמחה בנדל"ן.</p>`,
        content_en: `<h2>Step 1: Define Your Budget</h2><p>Before starting your search, define a realistic budget. Consider the total price including VAT, purchase costs, and legal fees.</p><h2>Step 2: Search for Projects</h2><p>Use our platform to find new construction projects across Israel. Filter by city, price range, and property type.</p><h2>Step 3: Visit the Project</h2><p>Schedule a meeting with the sales representative and visit the project. Check the construction quality, location, and surrounding infrastructure.</p><h2>Step 4: Sign the Contract</h2><p>After choosing an apartment, sign a purchase agreement. It's recommended to involve a real estate attorney.</p>`,
        image_url: "",
        published_at: "2026-07-01",
      },
      {
        slug: "new-construction-projects-tel-aviv-2026",
        title: "פרויקטים חדשים בתל אביב 2026",
        excerpt: "סקירה של פרויקטי הבנייה החדשים המבטיחים ביותר בתל אביב לשנת 2026.",
        content_he: `<h2>מגדל היובל</h2><p>מגדל יוקרתי בן 35 קומות בלב תל אביב. דירות נוף לים, גג פנטהאוז, בריכה וחדר כושר. המחירים נעים בין 2.5 ל-5.8 מיליון ש"ח.</p><h2>פרויקטים נוספים</h2><p>תל אביב ממשיכה להתפתח עם פרויקטים חדשים בשכונות פלורנטין, נווה צדק והצפון הישן. המחירים נעים בין 2 ל-8 מיליון ש"ח בהתאם למיקום וגודל הדירה.</p>`,
        content_en: `<h2>Migdal HaYovel</h2><p>A luxurious 35-story tower in the heart of Tel Aviv. Sea-view apartments, penthouse roof, swimming pool, and gym. Prices range from 2.5 to 5.8 million ILS.</p><h2>More Projects</h2><p>Tel Aviv continues to develop with new projects in Florentin, Neve Tzedek, and the Old North neighborhoods. Prices range from 2 to 8 million ILS depending on location and apartment size.</p>`,
        image_url: "",
        published_at: "2026-07-05",
      },
      {
        slug: "guide-to-real-estate-investment-in-israel",
        title: 'מדריך השקעות נדל"ן בישראל',
        excerpt: 'כל מה שצריך לדעת על השקעה בנדל"ן ישראלי — יתרונות, סיכונים ואסטרטגיות.',
        content_he: `<h2>למה להשקיע בנדל"ן ישראלי?</h2><p>שוק הנדל"ן הישראלי מציע הזדמנויות השקעה אטרקטיביות. הביקוש לדירות חדשות גבוה, המחירים יציבים, והתשואה על השקעה יכולה להיות משמעותית.</p><h2>סוגי השקעות</h2><p>השקעה בדירה חדשה בפריסייל מאפשרת כניסה במחיר נמוך יותר ועליית ערך עד למסירה. השקעה בנדל"ן מניב מספקת תזרים שוטף מהשכרה.</p><h2>טיפים למשקיעים</h2><p>בחרו מיקום אסטרטגי, בדקו את היזם והקבלן, השתמשו במינוף חכם, וגוון את ההשקעות.</p>`,
        content_en: `<h2>Why Invest in Israeli Real Estate?</h2><p>The Israeli real estate market offers attractive investment opportunities. Demand for new apartments is high, prices are stable, and returns can be significant.</p><h2>Investment Types</h2><p>Investing in a new apartment during pre-sale allows entry at a lower price with value appreciation until handover. Income-generating real estate provides ongoing rental cash flow.</p><h2>Tips for Investors</h2><p>Choose strategic locations, research the developer and contractor, use smart leverage, and diversify your investments.</p>`,
        image_url: "",
        published_at: "2026-07-10",
      },
    ];
    for (const post of posts) {
      _db.prepare("INSERT INTO blog_posts (id, slug, title, excerpt, content_he, content_en, image_url, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(crypto.randomUUID?.() || uuid(), post.slug, post.title, post.excerpt, post.content_he, post.content_en, post.image_url, post.published_at);
    }
  }

  return _db;
}

async function getSessionAgent(sessionId: string): Promise<any> {
  if (!sessionId) return null;
  const db = await getDb();
  return db.prepare(
    "SELECT a.id, a.name, a.company, a.email, a.phone, a.photo_url, a.description FROM sessions s JOIN agents a ON a.id = s.agent_id WHERE s.id = ?"
  ).get(sessionId) || null;
}

async function getProjectAgents(projectId: string): Promise<any[]> {
  return (await getDb()).prepare(
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
    const db = await getDb();
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
    const db = await getDb();
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
     (await getDb()).prepare("DELETE FROM sessions WHERE id = ?").run(match[1]);
    }
    return Response.json(
      { success: true },
      { headers: { "Set-Cookie": "session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0" } }
    );
  }

  // Public: List all projects (for homepage) with agents
  if (pathname === "/api/public/projects" && req.method === "GET") {
    const db = await getDb();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (id) {
      const project = db.prepare("SELECT id, name, description, description_he, description_en, city, address, lat, lng, property_types, price_min, price_max, unit_count, handover_date, status, photo_urls, floor_plan_urls, website_url, featured, created_at, updated_at FROM projects WHERE id = ?").get(id) as any;
      if (!project) return Response.json({ error: "Not found" }, { status: 404 });
      project.agents = await getProjectAgents(project.id);
      return Response.json({ project });
    }
    const projects = db.prepare("SELECT id, name, description, description_he, description_en, city, address, lat, lng, property_types, price_min, price_max, unit_count, handover_date, status, photo_urls, floor_plan_urls, website_url, featured, created_at, updated_at FROM projects ORDER BY featured DESC, created_at DESC").all();
    const result = await Promise.all((projects as any[]).map(async p => ({
      ...p,
      agents: await getProjectAgents(p.id),
    })));
    return Response.json({ projects: result });
  }

  // Public: Get agent details with their projects
  if (pathname.startsWith("/api/public/agents/") && req.method === "GET") {
    const agentId = pathname.replace("/api/public/agents/", "");
    if (!agentId) return Response.json({ error: "Agent ID required" }, { status: 400 });
    const db = await getDb();
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
    const agent = match ? await getSessionAgent(match[1]) : null;
    if (!agent) return Response.json({ projects: [], agent: null });
    const db = await getDb();
    const projects = db.prepare(`
      SELECT p.*, (SELECT COUNT(*) FROM leads WHERE project_id = p.id) as total_leads,
             (SELECT COUNT(*) FROM leads WHERE project_id = p.id AND seen = 0) as new_leads
      FROM projects p JOIN project_agents pa ON pa.project_id = p.id
      WHERE pa.agent_id = ? ORDER BY p.created_at DESC
    `).all(agent.id);
    const result = await Promise.all((projects as any[]).map(async p => ({
      ...p,
      agents: await getProjectAgents(p.id),
    })));
    return Response.json({ projects: result, agent });
  }

  // Projects: Create/Update (agent's own)
  if (pathname === "/api/projects" && req.method === "POST") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const agent = match ? await getSessionAgent(match[1]) : null;
    if (!agent) return Response.json({ error: "לא מחובר" }, { status: 401 });

    const body = await req.json();
    const { id, name, description, description_he, description_en, city, address, lat, lng, propertyTypes, priceMin, priceMax, unitCount, handoverDate, status, photoUrls, floorPlanUrls, websiteUrl } = body;
    if (!name || !city) return Response.json({ error: "שם ועיר נדרשים" }, { status: 400 });

    const db = await getDb();
    if (id) {
      // Check user is assigned to this project
      const rel = db.prepare("SELECT * FROM project_agents WHERE project_id = ? AND agent_id = ?").get(id, agent.id);
      if (!rel) return Response.json({ error: "Unauthorized" }, { status: 403 });
      db.prepare(`UPDATE projects SET name=?, description=?, description_he=?, description_en=?, city=?, address=?, lat=?, lng=?, property_types=?, price_min=?, price_max=?, unit_count=?, handover_date=?, status=?, photo_urls=?, floor_plan_urls=?, website_url=?, updated_at=datetime('now') WHERE id=?`)
        .run(name, description || "", description_he || "", description_en || "", city, address || "", lat || 0, lng || 0, JSON.stringify(propertyTypes || []), priceMin ?? 0, priceMax ?? 0, unitCount ?? 0, handoverDate || null, status || "pre-sale", JSON.stringify(photoUrls || []), JSON.stringify(floorPlanUrls || []), websiteUrl || "", id);
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
      db.prepare(`INSERT INTO projects (id, name, description, description_he, description_en, city, address, lat, lng, property_types, price_min, price_max, unit_count, handover_date, status, photo_urls, floor_plan_urls, website_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(projectId, name, description || "", description_he || "", description_en || "", city, address || "", lat || 0, lng || 0, JSON.stringify(propertyTypes || []), priceMin ?? 0, priceMax ?? 0, unitCount ?? 0, handoverDate || null, status || "pre-sale", JSON.stringify(photoUrls || []), JSON.stringify(floorPlanUrls || []), websiteUrl || "");
      db.prepare("INSERT INTO project_agents (project_id, agent_id) VALUES (?, ?)").run(projectId, agent.id);
      return Response.json({ success: true, id: projectId });
    }
  }

  // Projects: Delete
  if (pathname === "/api/projects" && req.method === "DELETE") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const agent = match ? await getSessionAgent(match[1]) : null;
    if (!agent) return Response.json({ error: "לא מחובר" }, { status: 401 });
    const url = new URL(req.url);
    const projectId = url.searchParams.get("id");
    if (!projectId) return Response.json({ error: "מזהה פרויקט נדרש" }, { status: 400 });
    const db = await getDb();
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
    const agent = match ? await getSessionAgent(match[1]) : null;
    if (!agent) return Response.json({ leads: [] });
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) return Response.json({ leads: [] });
    const db = await getDb();
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

    const db = await getDb();
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
              "Authorization": "Bearer " + (process.env.RESEND_API_KEY || "re_MHqhpdcD_F3EzDK5oso9DAEhHKuEVStZr"),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: process.env.RESEND_FROM || "MLS Israel <onboarding@resend.dev>",
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

    const agents = await getProjectAgents(projectId);
    return Response.json({ success: true, lead: { name: leadName, phone: leadPhone, email: leadEmail, message: leadMessage, projectName: project.name, agents } });
  }

  // Internal: Get pending email notifications (notified=0)
  if (pathname === "/api/pending-notifications" && req.method === "GET") {
    const db = await getDb();
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
    const db = await getDb();
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
   (await getDb()).prepare("UPDATE leads SET status = ? WHERE id = ?").run(status, id);
    return Response.json({ success: true });
  }

  // Leads: Delete
  if (pathname === "/api/leads/delete" && req.method === "POST") {
    const body = await req.json();
    if (!body.id) return Response.json({ error: "Lead ID required" }, { status: 400 });
   (await getDb()).prepare("DELETE FROM leads WHERE id = ?").run(body.id);
    return Response.json({ success: true });
  }

  // Admin: Login
  function checkAdminAuth(req: Request): boolean {
  const cookie = req.headers.get("cookie") || "";
  return cookie.includes("admin_token=logged_in");
}

// Admin: Login (password-only, env var ADMIN_PASSWORD)
  if (pathname === "/api/admin/login" && req.method === "POST") {
    const body = await req.json();
    const { password } = body;
    const adminPw = process.env.ADMIN_PASSWORD || "admin123";
    if (password === adminPw) {
      return Response.json(
        { success: true },
        { headers: { "Set-Cookie": `admin_token=logged_in; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800` } }
      );
    }
    return Response.json({ error: "סיסמה שגויה" }, { status: 401 });
  }

  // Admin: Dashboard
  if (pathname === "/api/admin/dashboard" && req.method === "GET") {
    if (!checkAdminAuth(req)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = await getDb();
    const projects = db.prepare("SELECT * FROM projects ORDER BY created_at DESC").all();
    const projectsWithAgents = await Promise.all((projects as any[]).map(async p => ({ ...p, agents: await getProjectAgents(p.id) })));
    const agentsList = db.prepare("SELECT id, name, company, email, phone, photo_url, description, created_at FROM agents ORDER BY created_at DESC").all();
    const leads = db.prepare("SELECT l.*, p.name as project_name, a.name as assigned_agent_name FROM leads l JOIN projects p ON p.id = l.project_id LEFT JOIN agents a ON a.id = l.assigned_agent_id ORDER BY l.created_at DESC LIMIT 100").all();
    const blogPosts = db.prepare("SELECT * FROM blog_posts ORDER BY created_at DESC").all();

    // Stats
    const stats = {
      totalProjects: (projects as any[]).length,
      totalAgents: (agentsList as any[]).length,
      totalLeads: (leads as any[]).length,
      preSale: (projects as any[]).filter(p => p.status === "pre-sale").length,
      underConstruction: (projects as any[]).filter(p => p.status === "under-construction").length,
      ready: (projects as any[]).filter(p => p.status === "ready").length,
    };

    return Response.json({ projects: projectsWithAgents, agents: agentsList, leads, blogPosts, stats });
  }

  // Admin: Delete project
  if (pathname === "/api/admin/projects/delete" && req.method === "POST") {
    if (!checkAdminAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
   (await getDb()).prepare("DELETE FROM projects WHERE id = ?").run(body.id);
    return Response.json({ success: true });
  }

  // Admin: Delete agent
  if (pathname === "/api/admin/agents/delete" && req.method === "POST") {
    if (!checkAdminAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
   (await getDb()).prepare("DELETE FROM agents WHERE id = ? AND email != 'chaim@bienenfeld.org'").run(body.id);
    return Response.json({ success: true });
  }

  // Admin: Toggle featured
  if (pathname === "/api/admin/projects/featured" && req.method === "POST") {
    if (!checkAdminAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const project =(await getDb()).prepare("SELECT featured FROM projects WHERE id = ?").get(body.id) as any;
    if (!project) return Response.json({ error: "Not found" }, { status: 404 });
    const newVal = project.featured ? 0 : 1;
   (await getDb()).prepare("UPDATE projects SET featured = ? WHERE id = ?").run(newVal, body.id);
    return Response.json({ success: true, featured: !!newVal });
  }

  // Admin: Create project (with duplicate check)
  if (pathname === "/api/admin/projects/create" && req.method === "POST") {
    if (!checkAdminAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { name, description, description_he, description_en, city, address, price_min, price_max, status, handover_date, photo_url, website_url, agent_id } = body;
    if (!name || !city) return Response.json({ error: "Name and city are required" }, { status: 400 });
    const db = await getDb();
    // Check duplicate
    const existing = db.prepare("SELECT id FROM projects WHERE name = ? AND city = ?").get(name, city) as any;
    if (existing) {
      if (agent_id) db.prepare("INSERT OR IGNORE INTO project_agents (project_id, agent_id) VALUES (?, ?)").run(existing.id, agent_id);
      return Response.json({ success: true, id: existing.id, added: true });
    }
    const id = uuid();
    const photoUrlsJson = photo_url ? JSON.stringify([photo_url]) : "[]";
    db.prepare("INSERT INTO projects (id, name, description, description_he, description_en, city, address, price_min, price_max, status, handover_date, photo_urls, website_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, name, description || "", description_he || "", description_en || "", city, address || "", price_min ? parseInt(price_min) : 0, price_max ? parseInt(price_max) : 0, status || "pre-sale", handover_date || "", photoUrlsJson, website_url || "");
    const targetAgentId = agent_id || "admin-001";
    db.prepare("INSERT INTO project_agents (project_id, agent_id) VALUES (?, ?)").run(id, targetAgentId);
    return Response.json({ success: true, id });
  }

  // Admin: Create agent
  if (pathname === "/api/admin/agents/create" && req.method === "POST") {
    if (!checkAdminAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { name, email, password, company, phone, description } = body;
    if (!name || !email || !password) return Response.json({ error: "Name, email, and password are required" }, { status: 400 });
    const db = await getDb();
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
    const agent = match ? await getSessionAgent(match[1]) : null;
    if (!checkAdminAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { id, name, description, description_he, description_en, city, address, price_min, price_max, status, handover_date, photo_url, website_url } = body;
    if (!id) return Response.json({ error: "Project ID is required" }, { status: 400 });
    const db = await getDb();
    if (!db.prepare("SELECT id FROM projects WHERE id = ?").get(id)) return Response.json({ error: "Not found" }, { status: 404 });
    const photoUrlsJson = photo_url ? JSON.stringify([photo_url]) : undefined;
    db.prepare(`UPDATE projects SET name = COALESCE(?, name), description = COALESCE(?, description), description_he = COALESCE(?, description_he), description_en = COALESCE(?, description_en), city = COALESCE(?, city), address = COALESCE(?, address), price_min = COALESCE(?, price_min), price_max = COALESCE(?, price_max), status = COALESCE(?, status), handover_date = COALESCE(?, handover_date), photo_urls = COALESCE(?, photo_urls), website_url = COALESCE(?, website_url), updated_at = datetime('now') WHERE id = ?`)
      .run(name || null, description || null, description_he || null, description_en || null, city || null, address || null, price_min ? parseInt(price_min) : null, price_max ? parseInt(price_max) : null, status || null, handover_date || null, photoUrlsJson || null, website_url || null, id);
    return Response.json({ success: true });
  }

  // Admin: Update agent
  if (pathname === "/api/admin/agents/update" && req.method === "POST") {
    if (!checkAdminAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { id, name, email, password, company, phone, description } = body;
    if (!id) return Response.json({ error: "Agent ID is required" }, { status: 400 });
    const db = await getDb();
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
    const agent = match ? await getSessionAgent(match[1]) : null;
    if (!agent) return Response.json({ error: "לא מחובר" }, { status: 401 });
    const body = await req.json();
    const { name, company, phone, description, email } = body;
    const db = await getDb();
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
    const agent = match ? await getSessionAgent(match[1]) : null;
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
    const db = await getDb();
    db.prepare("UPDATE agents SET photo_url = ? WHERE id = ?").run(photoUrl, agent.id);

    return Response.json({ success: true, photo_url: photoUrl });
  }

  // Translate endpoint (proxies to LibreTranslate)
  if (pathname === "/api/translate" && req.method === "POST") {
    const body = await req.json();
    const { q, source, target } = body;
    if (!q || !source || !target) {
      return Response.json({ error: "q, source, and target are required" }, { status: 400 });
    }
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${source}|${target}`);
      const data = await res.json();
      return Response.json({ translatedText: data.responseData?.translatedText || q });
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  // SEO: Schema.org JSON-LD
  if (pathname === "/api/seo/schema" && req.method === "GET") {
    const db = await getDb();
    const projects = db.prepare("SELECT id, name, description, city, price_min, price_max, updated_at FROM projects ORDER BY updated_at DESC LIMIT 50").all() as any[];
    const schema = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": "MLS Israel",
      "description": "הפלטפורמה המובילה לחיפוש פרויקטי בנייה חדשים בישראל. דירות חדשות, בתים ווילות בפריסייל ובבנייה.",
      "url": "https://mls-israel.ctonew.app",
      "areaServed": { "@type": "Country", "name": "IL" },
      "inLanguage": ["he", "en"],
      "itemListElement": projects.map((p: any) => ({
        "@type": "Product",
        "name": p.name,
        "description": p.description || "",
        "url": `https://mls-israel.ctonew.app/projects/${p.id}`,
        "address": { "@type": "PostalAddress", "addressLocality": p.city },
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "ILS",
          "lowPrice": p.price_min || 0,
          "highPrice": p.price_max || 0,
        },
      })),
    };
    return Response.json(schema);
  }

  // Blog: Public list
  if (pathname === "/api/blog" && req.method === "GET") {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const db = await getDb();
    if (slug) {
      const post = db.prepare("SELECT * FROM blog_posts WHERE slug = ?").get(slug) as any;
      if (!post) return Response.json({ error: "Not found" }, { status: 404 });
      return Response.json({ post });
    }
    const posts = db.prepare("SELECT id, slug, title, excerpt, image_url, published_at, created_at FROM blog_posts WHERE published_at IS NOT NULL ORDER BY published_at DESC").all();
    return Response.json({ posts });
  }

  // Blog: Admin CRUD (authenticated as admin)
  if (pathname === "/api/admin/blog" && req.method === "GET") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const agent = match ? await getSessionAgent(match[1]) : null;
    if (!checkAdminAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const db = await getDb();
    const posts = db.prepare("SELECT * FROM blog_posts ORDER BY created_at DESC").all();
    return Response.json({ posts });
  }

  if (pathname === "/api/admin/blog/create" && req.method === "POST") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const agent = match ? await getSessionAgent(match[1]) : null;
    if (!checkAdminAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { slug, title, excerpt, content_he, content_en, image_url, published_at } = body;
    if (!slug || !title) return Response.json({ error: "slug and title are required" }, { status: 400 });
    const db = await getDb();
    const id = uuid();
    db.prepare("INSERT INTO blog_posts (id, slug, title, excerpt, content_he, content_en, image_url, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, slug, title, excerpt || "", content_he || "", content_en || "", image_url || "", published_at || null);
    return Response.json({ success: true, id });
  }

  if (pathname === "/api/admin/blog/update" && req.method === "POST") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const agent = match ? await getSessionAgent(match[1]) : null;
    if (!checkAdminAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { id, slug, title, excerpt, content_he, content_en, image_url, published_at } = body;
    if (!id) return Response.json({ error: "id is required" }, { status: 400 });
    const db = await getDb();
    db.prepare("UPDATE blog_posts SET slug = COALESCE(?, slug), title = COALESCE(?, title), excerpt = COALESCE(?, excerpt), content_he = COALESCE(?, content_he), content_en = COALESCE(?, content_en), image_url = COALESCE(?, image_url), published_at = COALESCE(?, published_at) WHERE id = ?")
      .run(slug || null, title || null, excerpt || null, content_he || null, content_en || null, image_url || null, published_at || null, id);
    return Response.json({ success: true });
  }

  if (pathname === "/api/admin/blog/delete" && req.method === "POST") {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);
    const agent = match ? await getSessionAgent(match[1]) : null;
    if (!checkAdminAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    if (!body.id) return Response.json({ error: "id is required" }, { status: 400 });
   (await getDb()).prepare("DELETE FROM blog_posts WHERE id = ?").run(body.id);
    return Response.json({ success: true });
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

        // robots.txt
        if (pathname === "/robots.txt") {
          return new Response("User-agent: *\nAllow: /\nSitemap: https://mls-israel.ctonew.app/sitemap.xml\n", {
            headers: { "Content-Type": "text/plain" },
          });
        }

        // Sitemap
        if (pathname === "/sitemap.xml") {
          const db = await getDb();
          const projects = db.prepare("SELECT id, created_at FROM projects").all() as any[];
          const agents = db.prepare("SELECT id, created_at FROM agents").all() as any[];
          const blogs = db.prepare("SELECT slug, published_at FROM blog_posts WHERE published_at IS NOT NULL").all() as any[];
          const now = new Date().toISOString().split("T")[0];
          let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
          xml += `  <url><loc>https://mls-israel.ctonew.app/</loc><lastmod>${now}</lastmod><priority>1.0</priority></url>\n`;
          for (const p of projects) {
            const lastmod = p.created_at ? p.created_at.split(" ")[0] : now;
            xml += `  <url><loc>https://mls-israel.ctonew.app/projects/${p.id}</loc><lastmod>${lastmod}</lastmod><priority>0.8</priority></url>\n`;
          }
          for (const a of agents) {
            const lastmod = a.created_at ? a.created_at.split(" ")[0] : now;
            xml += `  <url><loc>https://mls-israel.ctonew.app/agents/${a.id}</loc><lastmod>${lastmod}</lastmod><priority>0.5</priority></url>\n`;
          }
          for (const b of blogs) {
            const lastmod = b.published_at ? b.published_at.split(" ")[0] : now;
            xml += `  <url><loc>https://mls-israel.ctonew.app/blog/${b.slug}</loc><lastmod>${lastmod}</lastmod><priority>0.6</priority></url>\n`;
          }
          xml += `</urlset>`;
          return new Response(xml, { headers: { "Content-Type": "application/xml" } });
        }

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
