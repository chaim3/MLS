import path from "node:path";
import fs from "node:fs";

let _db: any = null;

export async function getDbAsync(): Promise<any> {
  if (_db) return _db;
  const { Database } = await import("bun:sqlite");
  const dbDir = path.resolve(process.cwd(), "data");
  const dbPath = path.resolve(dbDir, "newbuild.db");
  fs.mkdirSync(dbDir, { recursive: true });
  // Ensure the current user owns the data directory and its contents.
  // Without this, files created by a root publish would be read-only for the
  // non-root server process, causing SQLITE_READONLY on every write.
  try {
    const { stdout: whoami } = Bun.spawnSync(["whoami"], { stdout: "pipe" });
    const user = whoami.toString().trim();
    if (user && user !== "root") {
      Bun.spawnSync(["sudo", "chown", "-R", `${user}:team`, dbDir]);
    }
  } catch (_) { /* best-effort; mkdirSync above would have failed already if unwritable */ }
  _db = new Database(dbPath);
  _db.exec("PRAGMA journal_mode = WAL");
  _db.exec("PRAGMA foreign_keys = ON");
  _db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, company TEXT NOT NULL DEFAULT '',
      email TEXT UNIQUE NOT NULL, phone TEXT NOT NULL DEFAULT '',
      password TEXT NOT NULL, photo_url TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY, agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', city TEXT NOT NULL,
      address TEXT NOT NULL DEFAULT '', lat REAL NOT NULL DEFAULT 0, lng REAL NOT NULL DEFAULT 0,
      property_types TEXT NOT NULL DEFAULT '[]', price_min INTEGER NOT NULL DEFAULT 0,
      price_max INTEGER NOT NULL DEFAULT 0, unit_count INTEGER NOT NULL DEFAULT 0,
      handover_date TEXT, status TEXT NOT NULL DEFAULT 'pre-sale',
      photo_urls TEXT NOT NULL DEFAULT '[]', floor_plan_urls TEXT NOT NULL DEFAULT '[]',
      website_url TEXT NOT NULL DEFAULT '',
      description_he TEXT NOT NULL DEFAULT '', description_en TEXT NOT NULL DEFAULT '',
      featured INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS project_agents (
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      PRIMARY KEY (project_id, agent_id)
    );
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
      name TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  // Seed demo data if empty
  const count = _db.prepare("SELECT COUNT(*) as c FROM projects").get() as any;
  if (count.c === 0) {
    // Restore from backup if available (preserves owner's photos/links)
    const backupPath = path.resolve(dbDir, "seed_backup.db");
    if (fs.existsSync(backupPath)) {
      _db.close();
      fs.copyFileSync(backupPath, dbPath);
      _db = new Database(dbPath);
      _db.exec("PRAGMA journal_mode = WAL");
      _db.exec("PRAGMA foreign_keys = ON");
    } else {
      seedDemoData(_db);
    }
  }
  return _db;
}

function seedDemoData(db: any) {
  const agentId = "demo-agent-001";
  const { hashSync } = require("bcryptjs");
  db.prepare(`INSERT INTO agents (id, name, company, email, phone, password, description) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(agentId, "יוסי כהן", "כהן נדל״ן וייעוץ", "yossi@cohen-realestate.co.il", "050-1234567", hashSync("demo123", 10), "יועץ נדל״ן מנוסה עם 20 שנות ניסיון בליווי רוכשים בפרויקטים חדשים ברחבי הארץ. מתמחה בפרויקטי יוקרה, דירות להשקעה וקהילות אנגלו-דתיות.");

  const projects = [{
    id: "demo-001", name: "מגדל היובל", desc: "מגדל יוקרתי בן 42 קומות בלב תל אביב, במרחק הליכה מכיכר רבין וחוף הים. המגדל מציע דירות 3-5 חדרים, דופלקסים ופנטהאוזים מרהיבים עם נוף לים. הדיירים נהנים מבריכת שחייה על הגג, חדר כושר מאובזר, לובי מעוצב ושירותי קונסיירז' 24/7.", descEn: "A luxurious 42-story tower in the heart of Tel Aviv, walking distance from Rabin Square and the beach. Offering 3-5 room apartments, duplexes, and stunning penthouses with sea views. Residents enjoy a rooftop pool, fully equipped gym, designer lobby, and 24/7 concierge services.", city: "תל אביב", address: "רחוב היובל 15, תל אביב", types: ["דירה","דופלקס","פנטהאוז"], priceMin: 2800000, priceMax: 8500000, units: 120, handover: "רבעון 3 2027", status: "under-construction", featured: 1, website: "https://migdal-hayovel.co.il"
  },{
    id: "demo-002", name: "נופי כרמל", desc: "שכונת יוקרה על מורדות הכרמל עם נוף פנורמי עוצר נשימה למפרץ חיפה. הפרויקט כולל דירות גן עם חצרות פרטיות, פנטהאוזים מרווחים וקוטג'ים דו-משפחתיים. בקרבת מקום: מרכז חורב, אוניברסיטת חיפה, פארק הכרמל ומסלולי הליכה.", descEn: "A luxury neighborhood on the Carmel slopes with breathtaking panoramic views of Haifa Bay. The project includes garden apartments with private yards, spacious penthouses, and semi-detached cottages. Nearby: Horev Center, University of Haifa, Carmel Park, and hiking trails.", city: "חיפה", address: "דרך הים 8, חיפה", types: ["דירה","בית פרטי","קוטג'"], priceMin: 2200000, priceMax: 4200000, units: 85, handover: "רבעון 1 2027", status: "pre-sale", featured: 1, website: "https://nof-carmel.co.il"
  },{
    id: "demo-003", name: "אבני העיר", desc: "שכונה חדשה ואיכותית בגבעת זאב עם 64 יחידות דיור — דירות מרווחות ובתים פרטיים. 10 דקות מירושלים, עם קווי תחבורה ציבורית ישירים. בכל דירה: מרפסת שמש, חניה פרטית, מחסן. האזור מתפתח במהירות עם מרכזים מסחריים, בתי ספר וגני ילדים חדשים.", descEn: "A new high-quality neighborhood in Givat Ze'ev with 64 housing units — spacious apartments and private homes. 10 minutes from Jerusalem, with direct public transport lines. Every unit includes: sun balcony, private parking, and storage room. The area is rapidly developing with new commercial centers, schools, and kindergartens.", city: "givat ze'ev", address: "שדרות בגין 22, גבעת זאב", types: ["דירה","בית פרטי"], priceMin: 1950000, priceMax: 3800000, units: 64, handover: "רבעון 2 2027", status: "under-construction", featured: 0, website: ""
  },{
    id: "demo-004", name: "פארק הראשונים", desc: "פרויקט מגורים מודרני בלב ראשון לציון, צמוד לפארק הראשונים. 150 דירות ב-4 בניינים בני 12 קומות כל אחד. דירות 3-5 חדרים בעיצוב עכשווי, מרפסות שמש מרווחות, חניה תת קרקעית. בקרבת מקום: תחנת רכבת, קניון הזהב, מרכזי בילוי ומוסדות חינוך.", descEn: "A modern residential project in the heart of Rishon LeZion, adjacent to Park HaRishonim. 150 apartments in 4 buildings of 12 floors each. 3-5 room apartments with contemporary design, spacious sun balconies, underground parking. Nearby: train station, HaZahav Mall, entertainment centers, and educational institutions.", city: "ראשון לציון", address: "שדרות הרצל 120, ראשון לציון", types: ["דירה","דירת גן"], priceMin: 1700000, priceMax: 2900000, units: 150, handover: "רבעון 4 2026", status: "ready", featured: 0, website: ""
  },{
    id: "demo-005", name: "מרינה הרצליה", desc: "מגדל יוקרה במרינה הרצליה — 48 דירות יוקרה עם נוף לים ולמרינה. דירות 4-6 חדרים, תקרות גבוהות, מטבחי יוקרה, מערכת בית חכם. דיירים נהנים מבריכת אינפיניטי, ספא, חדר יין, ושירותי ניהול ברמה הגבוהה ביותר. 5 דקות הליכה מהחוף.", descEn: "A luxury tower at Herzliya Marina — 48 exclusive residences with sea and marina views. 4-6 room apartments, high ceilings, designer kitchens, smart home systems. Residents enjoy an infinity pool, spa, wine room, and top-tier management services. 5 minutes walk to the beach.", city: "הרצליה", address: "רחוב הסירות 5, הרצליה פיתוח", types: ["דירה","דופלקס","פנטהאוז"], priceMin: 4500000, priceMax: 12000000, units: 48, handover: "רבעון 1 2028", status: "pre-sale", featured: 1, website: ""
  },{
    id: "demo-006", name: "נווה מדבר", desc: "פרויקט דיור מודרני בשכונת הפארק בבאר שבע, צמוד לפארק ההייטק. 200 דירות 3-5 חדרים במחירים נוחים במיוחד. קרוב לאוניברסיטת בן גוריון, תחנת הרכבת צפון, מרכזי קניות ופארקים עירוניים. אידיאלי לזוגות צעירים, משפחות ומשקיעים.", descEn: "A modern housing project in the Park neighborhood of Beer Sheva, adjacent to the High-Tech Park. 200 apartments of 3-5 rooms at exceptionally affordable prices. Close to Ben Gurion University, Beer Sheva North train station, shopping centers, and urban parks. Ideal for young couples, families, and investors.", city: "באר שבע", address: "שדרות רגר 85, באר שבע", types: ["דירה","דירת גן"], priceMin: 1200000, priceMax: 2100000, units: 200, handover: "רבעון 3 2027", status: "under-construction", featured: 0, website: ""
  },{
    id: "demo-007", name: "Stone", desc: "Discover one of the last opportunities to own a private residence in the Jerusalem Hills - a rare collection of 98 private homes surrounded by breathtaking natural beauty.\n5-8 bedroom private houses | Dutch-inspired street concept | Nature-reserve walking path | 2 parking spaces | Outdoor kitchen, pool & hot tub (optional) | 0% Purchase Tax.", descEn: "Discover one of the last opportunities to own a private residence in the Jerusalem Hills - a rare collection of 98 private homes surrounded by breathtaking natural beauty.\n5-8 bedroom private houses | Dutch-inspired street concept | Nature-reserve walking path | 2 parking spaces | Outdoor kitchen, pool & hot tub (optional) | 0% Purchase Tax.", city: "givat ze'ev", address: "Jerusalem Hills, Givat Ze'ev", types: ["בית פרטי"], priceMin: 0, priceMax: 0, units: 98, handover: "", status: "under-construction", featured: 0, website: "https://12-stones.co.il/landing/?utm_source=iIn"
  },{
    id: "demo-008", name: "CARMAY-HANADIV", desc: "*July 19 Webinar:* Discover a Warm Anglo Community Within Reach\n🏡 Carmay HaNadiv offers a warm, growing Anglo dati community, high-standard homes, attractive prices and easy access to the centre of the country.\n💱 NOW, overseas buyers can also benefit from a special exchange rate of $1 = ₪3.5 on the first 10% down payment.\n🖥️ Register now for the webinar to learn more about the community, the homes, and the location.\n*Special rate applies to the first 10% down payment only.", descEn: "*July 19 Webinar:* Discover a Warm Anglo Community Within Reach\n🏡 Carmay HaNadiv offers a warm, growing Anglo dati community, high-standard homes, attractive prices and easy access to the centre of the country.\n💱 NOW, overseas buyers can also benefit from a special exchange rate of $1 = ₪3.5 on the first 10% down payment.\n🖥️ Register now for the webinar to learn more about the community, the homes, and the location.\n*Special rate applies to the first 10% down payment only.", city: "CARMAY-HANADIV", address: "Carmay HaNadiv", types: ["דירה","בית פרטי"], priceMin: 0, priceMax: 0, units: 0, handover: "", status: "under-construction", featured: 0, website: "https://swiy.co/ILNCN"
  }];

  const insertProj = db.prepare(`INSERT OR IGNORE INTO projects (id, name, description, description_he, description_en, city, address, property_types, price_min, price_max, unit_count, handover_date, status, featured, website_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertPa = db.prepare(`INSERT OR IGNORE INTO project_agents (project_id, agent_id) VALUES (?, ?)`);

  for (const p of projects) {
    insertProj.run(p.id, p.name, p.desc, p.desc, p.descEn, p.city, p.address, JSON.stringify(p.types), p.priceMin, p.priceMax, p.units, p.handover, p.status, p.featured, p.website);
    insertPa.run(p.id, agentId);
  }
}