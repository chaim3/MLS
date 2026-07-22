// Simple i18n system for Hebrew/English support

export type Lang = "he" | "en";

export const translations: Record<Lang, Record<string, string>> = {
  he: {
    // Global
    "site.name": "MLS Israel",
    "site.tagline": "הפלטפורמה המובילה לחיפוש פרויקטי בנייה חדשים בישראל",
    "site.description": "דירות חדשות, בתים ווילות בפריסייל ובבנייה",

    // Homepage Hero
    "hero.title": "כל פרויקטי הבנייה החדשים בישראל",
    "hero.subtitle":
      "חפשו דירות חדשות, בתים ווילות בפרויקטי בנייה חדשים — מתל אביב ועד אילת. מחירים, תוכניות קומה, תאריכי מסירה ופרטי קשר ישירים.",
    "search.city": "עיר",
    "search.allTypes": "כל הסוגים",
    "search.allStatuses": "כל הסטטוסים",
    "search.apartment": "דירה",
    "search.house": "בית פרטי",
    "search.villa": "וילה",
    "search.duplex": "דופלקס",
    "search.minPrice": "מחיר מינימום",
    "search.maxPrice": "מחיר מקסימום",
    "search.search": "חפש",
    "search.noResults": "לא נמצאו פרויקטים",
    "search.noResultsHint": "נסו לשנות את החיפוש או לחזור מאוחר יותר",
    "search.results": "פרויקטים חדשים",

    // Footer
    "footer.forBuyers": "לקונים",
    "footer.forAgents": "יזמים",
    "footer.contact": "צור קשר",
    "footer.blog": "בלוג ומדריכים",
    "footer.about": "אודות",
    "footer.browseProjects": "עיון בפרויקטים",
    "footer.searchByCity": "חיפוש לפי עיר",
    "footer.featuredProjects": "פרויקטים מומלצים",
    "footer.listYourProject": "הוסף פרויקט",
    "footer.agentDashboard": "כניסה ליזמים",
    "footer.premiumPlans": "מסלולי פרימיום",
    "footer.privacy": "מדיניות פרטיות",
    "footer.terms": "תנאי שימוש",
    "nav.about": "אודות",
    "nav.blog": "בלוג",

    // Stats
    "stats.activeProjects": "פרויקטים פעילים",
    "stats.directContact": "פרטי קשר ישירים ליזמים",
    "stats.allCountry": "כל הארץ",

    // Project Card
    "status.pre-sale": "מכירה מוקדמת",
    "status.under-construction": "בבנייה",
    "status.ready": "מוכן למסירה",
    "project.featured": "מומלץ",
    "project.handover": "מסירה",
    "project.from": "החל מ-",
    "project.units": 'יח"ד',

    // Project Detail
    "project.back": "← חזרה לכל הפרויקטים",
    "project.notFound": "הפרויקט לא נמצא",
    "project.backHome": "חזרה לדף הבית",
    "project.minPrice": "מחיר מינימום",
    "project.maxPrice": "מחיר מקסימום",
    "project.units2": "יחידות",
    "project.handover2": "מסירה",
    "project.photos": "תמונות",
    "project.floorPlans": "תוכניות קומה",
    "project.contact": "איש קשר",
    "project.contactForm": "צור קשר",
    "project.contactName": "שם מלא *",
    "project.contactPhone": "טלפון *",
    "project.contactEmail": "אימייל",
    "project.contactMessage": "הודעה",
    "project.contactSubmit": "שלח פנייה",
    "project.contactSuccess": "הפנייה נשלחה בהצלחה!",
    "project.contactError": "שגיאה בשליחה",
    "project.price": "טווח מחירים",
    "project.agents": "נציגי הפרויקט",
    "project.description": "תיאור",
    "project.noAgents": "אין נציגים זמינים כרגע",
    "project.selectAgent": "אנא בחר נציג",
    "project.sending": "שולח...",
    "project.selected": "נבחר",
    "project.selectAgentHint": "",
    "agent.description": "תיאור",
    "agent.detailTitle": "פרופיל נציג",
    "agent.detailProjects": "הפרויקטים של",
    "agent.detailNoProjects": "אין פרויקטים כרגע",
    "agent.detailViewProject": "צפה בפרופיל",
    "agent.detailContact": "צור קשר",
    "dashboard.editProfile": "עריכת פרופיל",
    "dashboard.profileUpdated": "הפרופיל עודכן",
    "dashboard.save": "שמור",
    "dashboard.saveProject": "שמור פרויקט",
    "project.website": "אתר הפרויקט",
    "project.visitWebsite": "בקר באתר הפרויקט",

    // Auth
    "agent.login": "כניסת סוכן",
    "agent.signup": "הרשמת סוכן",
    "agent.loginTitle": "התחברות לסוכנים",
    "agent.signupTitle": "הרשמה לסוכנים — זה בחינם!",
    "agent.email": "אימייל",
    "agent.password": "סיסמה",
    "agent.confirmPassword": "אימות סיסמה *",
    "agent.loginBtn": "התחבר",
    "agent.signupBtn": "הרשמה",
    "agent.noAccount": "אין לך חשבון?",
    "agent.hasAccount": "כבר רשום?",
    "agent.signupLink": "הרשמה",
    "agent.loginLink": "התחבר",
    "agent.freeTier": "ההרשמה חינם לחלוטין. פרסם פרויקטים ללא עלות.",
    "agent.name": "שם מלא *",
    "agent.company": "שם חברה",
    "agent.phone": "טלפון",
    "agent.errorRequired": "שם, אימייל וסיסמה נדרשים",
    "agent.errorEmailExists": "האימייל כבר רשום במערכת",
    "agent.errorInvalid": "אימייל או סיסמה שגויים",
    "agent.errorPasswordMismatch": "הסיסמאות לא תואמות",

    // Dashboard
    "dashboard.title": "לוח הבקרה שלי",
    "dashboard.newProject": "+ פרויקט חדש",
    "dashboard.loading": "טוען...",
    "dashboard.empty": 'אין פרויקטים עדיין. לחץ על "פרויקט חדש" כדי להתחיל.',
    "dashboard.edit": "ערוך",
    "dashboard.delete": "מחק",
    "dashboard.leads": "פניות",
    "dashboard.logout": "התנתק",
    "dashboard.new": "חדשים",
    "dashboard.newProjectTitle": "פרויקט חדש",
    "dashboard.editProjectTitle": "עריכת פרויקט",
    "dashboard.projectName": "שם פרויקט *",
    "dashboard.projectCity": "עיר *",
    "dashboard.projectAddress": "כתובת",
    "dashboard.projectStatus": "סטטוס",
    "dashboard.projectPriceMin": "מחיר מינימום (₪)",
    "dashboard.projectPriceMax": "מחיר מקסימום (₪)",
    "dashboard.projectUnits": "כמות יחידות",
    "dashboard.projectHandover": 'תאריך מסירה (e.g., רבעון 2 2026)',
    "dashboard.projectWebsite": "אתר הפרויקט (URL)",
    "dashboard.propertyTypes": "סוגי נכסים",
    "dashboard.projectDescription": "תיאור הפרויקט",
    "dashboard.photoUrls": "כתובות תמונות (כתובת אחת בכל שורה)",
    "dashboard.floorPlanUrls": "כתובות תוכניות קומה (כתובת אחת בכל שורה)",
    "dashboard.noLeads": "אין פניות עדיין",
    "dashboard.deleteConfirm": "למחוק את הפרויקט?",
    "dashboard.saveError": "שגיאה בשמירה",
    "dashboard.leadsFor": "פניות -",
    "dashboard.uploadPhoto": "העלאת תמונת פרופיל",
    "dashboard.uploadProjectPhoto": "העלאת תמונה",
    "dashboard.photoHint": "JPEG, PNG, WebP או GIF. גודל מקסימלי 5MB",

    // Leads status
    "leads.status.new": "חדשה",
    "leads.status.contacted": "נוצר קשר",
    "leads.status.in_progress": "בטיפול",
    "leads.status.completed": "הושלם",

    // Language
    "lang.he": "עברית",
    "lang.en": "English",

    // Cities
    "city.tel_aviv": "תל אביב",
    "city.haifa": "חיפה",
    "city.givat_ze_ev": "גבעת זאב",
    "city.carmay_hanadiv": "כרמי הנדיב",
    "city.rishon_le_ziyon": "ראשון לציון",
    "city.herzliya": "הרצליה",
    "city.beer_sheva": "באר שבע",

    // Admin
    "admin.title": "לוח ניהול",
    "admin.ownerPanel": "לוח בעלים",
    "admin.loginFailed": "התחברות נכשלה",
    "admin.adminDashboard": "לוח ניהול",
    "admin.featured": "מומלץ",
    "admin.basicInfo": "מידע בסיסי",
    "admin.totalProjects": "סה\"כ פרויקטים",
    "admin.totalAgents": "סה\"כ סוכנים",
    "admin.totalLeads": "סה\"כ פניות",
    "admin.preSale": "בפריסייל",
    "admin.underConstruction": "בבנייה",
    "admin.ready": "מוכן למסירה",

    // Blog
    "blog.title": "בלוג",
    "blog.articleNotFound": "הכתבה לא נמצאה",

    // Agent
    "agent.loginFailed": "התחברות נכשלה",
  },
  en: {
    // Global
    "site.name": "MLS Israel",
    "site.tagline": "The leading platform for finding new construction projects across Israel",
    "site.description": "New apartments, houses, and villas in pre-sale and under construction",

    // Homepage Hero
    "hero.title": "All New Construction Projects in Israel",
    "hero.subtitle":
      "Browse new apartments, houses, and villas in new developments — from Tel Aviv to Eilat. Prices, floor plans, handover dates, and direct contact info.",
    "search.city": "City",
    "search.allTypes": "All Types",
    "search.allStatuses": "All Statuses",
    "search.apartment": "Apartment",
    "search.house": "House",
    "search.villa": "Villa",
    "search.duplex": "Duplex",
    "search.minPrice": "Min Price",
    "search.maxPrice": "Max Price",
    "search.search": "Search",
    "search.noResults": "No projects found",
    "search.noResultsHint": "Try changing your search or come back later",
    "search.results": "New Projects",

    // Footer
    "footer.forBuyers": "Buyers",
    "footer.forAgents": "Developers",
    "footer.contact": "Contact",
    "footer.blog": "Blog & Guides",
    "footer.about": "About Us",
    "footer.browseProjects": "Browse Projects",
    "footer.searchByCity": "Search by City",
    "footer.featuredProjects": "Featured Projects",
    "footer.listYourProject": "List Your Project",
    "footer.agentDashboard": "Agent Dashboard",
    "footer.premiumPlans": "Premium Plans",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Use",
    "nav.about": "About",
    "nav.blog": "Blog",

    // Stats
    "stats.activeProjects": "Active Projects",
    "stats.directContact": "Direct Developer Contact",
    "stats.allCountry": "All Across Israel",

    // Project Card
    "status.pre-sale": "Pre-Sale",
    "status.under-construction": "Under Construction",
    "status.ready": "Ready for Handover",
    "project.featured": "Featured",
    "project.handover": "Handover",
    "project.from": "From ",
    "project.units": "units",

    // Project Detail
    "project.back": "← Back to all projects",
    "project.notFound": "Project not found",
    "project.backHome": "Back to homepage",
    "project.minPrice": "Min Price",
    "project.maxPrice": "Max Price",
    "project.units2": "Units",
    "project.handover2": "Handover",
    "project.photos": "Photos",
    "project.floorPlans": "Floor Plans",
    "project.contact": "Contact Person",
    "project.contactForm": "Contact Us",
    "project.contactName": "Full Name *",
    "project.contactPhone": "Phone *",
    "project.contactEmail": "Email",
    "project.contactMessage": "Message",
    "project.contactSubmit": "Send Inquiry",
    "project.contactSuccess": "Inquiry sent successfully!",
    "project.contactError": "Error sending inquiry",
    "project.price": "Price Range",
    "project.agents": "Project Agents",
    "project.description": "Description",
    "project.noAgents": "No agents available",
    "project.selectAgent": "Please select an agent",
    "project.sending": "Sending...",
    "project.selected": "Agent Selected",
    "project.selectAgentHint": "",
    "agent.description": "Description",
    "agent.detailTitle": "Agent Profile",
    "agent.detailProjects": "Projects by",
    "agent.detailNoProjects": "No projects yet",
    "agent.detailViewProject": "View Profile",
    "agent.detailContact": "Contact",
    "dashboard.editProfile": "Edit Profile",
    "dashboard.profileUpdated": "Profile updated",
    "project.website": "Project Website",
    "project.visitWebsite": "Visit Project Website",

    // Auth
    "agent.login": "Agent Login",
    "agent.signup": "Agent Signup",
    "agent.loginTitle": "Agent Login",
    "agent.signupTitle": "Agent Signup — It's Free!",
    "agent.email": "Email",
    "agent.password": "Password",
    "agent.confirmPassword": "Confirm Password *",
    "agent.loginBtn": "Login",
    "agent.signupBtn": "Sign Up",
    "agent.noAccount": "Don't have an account?",
    "agent.hasAccount": "Already registered?",
    "agent.signupLink": "Sign Up",
    "agent.loginLink": "Login",
    "agent.freeTier": "Registration is completely free. List projects at no cost.",
    "agent.name": "Full Name *",
    "agent.company": "Company Name",
    "agent.phone": "Phone",
    "agent.errorRequired": "Name, email and password are required",
    "agent.errorEmailExists": "This email is already registered",
    "agent.errorInvalid": "Invalid email or password",
    "agent.errorPasswordMismatch": "Passwords do not match",

    // Dashboard
    "dashboard.title": "My Dashboard",
    "dashboard.newProject": "+ New Project",
    "dashboard.loading": "Loading...",
    "dashboard.empty": 'No projects yet. Click "New Project" to get started.',
    "dashboard.edit": "Edit",
    "dashboard.delete": "Delete",
    "dashboard.leads": "Leads",
    "dashboard.logout": "Logout",
    "dashboard.save": "Save Profile",
    "dashboard.new": "new",
    "dashboard.saveProject": "Save Project",
    "dashboard.newProjectTitle": "New Project",
    "dashboard.editProjectTitle": "Edit Project",
    "dashboard.projectName": "Project Name *",
    "dashboard.projectCity": "City *",
    "dashboard.projectAddress": "Address",
    "dashboard.projectStatus": "Status",
    "dashboard.projectPriceMin": "Min Price (₪)",
    "dashboard.projectPriceMax": "Max Price (₪)",
    "dashboard.projectUnits": "Number of Units",
    "dashboard.projectHandover": "Handover Date (e.g., Q2 2026)",
    "dashboard.projectWebsite": "Project Website (URL)",
    "dashboard.propertyTypes": "Property Types",
    "dashboard.projectDescription": "Project Description",
    "dashboard.photoUrls": "Photo URLs (one per line)",
    "dashboard.floorPlanUrls": "Floor Plan URLs (one per line)",
    "dashboard.noLeads": "No leads yet",
    "dashboard.deleteConfirm": "Delete this project?",
    "dashboard.saveError": "Error saving",
    "dashboard.leadsFor": "Leads -",
    "dashboard.uploadPhoto": "Upload Profile Photo",
    "dashboard.uploadProjectPhoto": "Upload Photo",
    "dashboard.photoHint": "JPEG, PNG, WebP or GIF. Max size 5MB",

    // Leads status
    "leads.status.new": "New",
    "leads.status.contacted": "Contacted",
    "leads.status.in_progress": "In Progress",
    "leads.status.completed": "Completed",

    // Language
    "lang.he": "עברית",
    "lang.en": "English",

    // Cities
    "city.tel_aviv": "Tel Aviv",
    "city.haifa": "Haifa",
    "city.givat_ze_ev": "Givat Ze'ev",
    "city.carmay_hanadiv": "Carmay HaNadiv",
    "city.rishon_le_ziyon": "Rishon LeZion",
    "city.herzliya": "Herzliya",
    "city.beer_sheva": "Beer Sheva",

    // Admin
    "admin.title": "Admin",
    "admin.ownerPanel": "Owner Panel",
    "admin.loginFailed": "Login failed",
    "admin.adminDashboard": "Admin Dashboard",
    "admin.featured": "Featured",
    "admin.basicInfo": "Basic Info",
    "admin.totalProjects": "Total Projects",
    "admin.totalAgents": "Total Agents",
    "admin.totalLeads": "Total Leads",
    "admin.preSale": "Pre-Sale",
    "admin.underConstruction": "Under Construction",
    "admin.ready": "Ready",

    // Blog
    "blog.title": "Blog",
    "blog.articleNotFound": "Article not found",

    // Agent
    "agent.loginFailed": "Login failed",
  },
};

export function t(key: string, lang: Lang): string {
  return translations[lang]?.[key] ?? translations.he[key] ?? key;
}

export function getLang(): Lang {
  if (typeof window === "undefined") return "he";
  return (localStorage.getItem("lang") as Lang) || "he";
}

export function setLang(lang: Lang): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("lang", lang);
  }
}

// Map DB city values to translation key suffixes (normalized)
const cityKeyMap: Record<string, string> = {
  "תל אביב": "tel_aviv",
  "חיפה": "haifa",
  "givat ze'ev": "givat_ze_ev",
  "CARMAY-HANADIV": "carmay_hanadiv",
  "ראשון לציון": "rishon_le_ziyon",
  "הרצליה": "herzliya",
  "באר שבע": "beer_sheva",
};

export function translateCity(city: string, lang: Lang): string {
  const key = cityKeyMap[city];
  if (!key) return city;
  return translations[lang]?.[`city.${key}`] ?? city;
}

export function getCitySearchableValues(city: string): string[] {
  const key = cityKeyMap[city];
  if (!key) return [city];
  const he = translations.he?.[`city.${key}`] ?? city;
  const en = translations.en?.[`city.${key}`] ?? city;
  return [he, en];
}