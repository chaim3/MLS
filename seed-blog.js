import { Database } from "bun:sqlite";
const db = new Database("data/newbuild.db");

db.exec("DELETE FROM blog_posts");

// Article 1: How to Buy a New Apartment in Israel
db.prepare(`INSERT INTO blog_posts (id, slug, title, excerpt, content_he, content_en, image_url, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
  "a1",
  "how-to-buy-a-new-apartment-in-israel",
  "איך לקנות דירה חדשה בישראל - מדריך מקיף",
  "מדריך שלב אחר שלב לרכישת דירה חדשה מקבלן בישראל. כל מה שצריך לדעת מהחיפוש ועד קבלת המפתחות, כולל טיפים למימון, עורכי דין ובדיקות קבלן.",
  `<h2>שלב 1: הגדרת תקציב ריאלי</h2>
<p>לפני שמתחילים לחפש דירה חדשה, הצעד הראשון והחשוב ביותר הוא הגדרת תקציב ברור. קחו בחשבון לא רק את מחיר הדירה עצמה, אלא גם את ההוצאות הנלוות: מע"מ בשיעור 18% על דירות חדשות (למעט דירות במחיר מטרה), הוצאות רכישה כמו מס רכישה (החל מ-0% ועד 10% בהתאם למחיר הדירה), שכר טרחת עורך דין (בדרך כלל 0.5%-1% ממחיר הדירה), דמי תיווך (אם רלוונטי), והוצאות נוספות כמו שמאי, בדק בית, ושיפוצים אפשריים.</p>
<p>מומלץ לקבל אישור עקרוני מהבנק למשכנתא לפני שמתחילים בחיפוש. בדקו כמה אתם יכולים להרשות לעצמכם בהתחשב בהחזר החודשי, הריבית הנוכחית במשק, ותקופת ההלוואה. זכרו שהמשכנתא בישראל מחולקת בדרך כלל למספר מסלולים - ריבית קבועה, ריבית משתנה, וקל"צ - ושילוב נכון יכול לחסוך עשרות אלפי שקלים.</p>

<h2>שלב 2: חיפוש הפרויקט המתאים</h2>
<p>החיפוש אחר הדירה המתאימה מתחיל בזיהוי האזור המועדף עליכם. שקלו גורמים כמו קרבה למקום העבודה, מוסדות חינוך, תחבורה ציבורית, שירותים קהילתיים, ותוכניות פיתוח עתידיות. אתר MLS Israel מרכז פרויקטים חדשים מכל רחבי הארץ במקום אחד, כך שתוכלו לסנן לפי עיר, טווח מחירים, סוג נכס וסטטוס פרויקט.</p>
<p>כשמבקרים בפרויקט, שימו לב לאיכות הבנייה, לחומרים בהם משתמשים, למוניטין היזם והקבלן, ולתנאי התשלום. בדקו פרויקטים קודמים של אותו יזם ובקרו בהם כדי להתרשם מרמת הגימור. אל תהססו לשאול שאלות על תשתיות, אחריות על ליקויי בנייה, ואפשרויות התאמה אישית.</p>

<h2>שלב 3: הבנת תנאי החוזה</h2>
<p>חוזה רכישה של דירה חדשה מקבלן כולל סעיפים רבים שחשוב להבין. אחד הסעיפים החשובים ביותר הוא לוח הזמנים למסירה - הקבלן מתחייב למסור את הדירה במועד מסוים, אך פעמים רבות יש סעיף פיצוי קבוע מראש (פיצוי מוסכם) במקרה של איחור. הבינו את התנאים והקפידו שיהיו הוגנים.</p>
<p>סעיפים חשובים נוספים כוללים: מפרט טכני (מה כלול בדירה ומה לא), תנאי תשלום (בדרך כלל 8-10 תשלומים לאורך תקופת הבנייה), זכות לקבלת הלוואות קבלן, ואחריות על ליקויי בנייה (שנתיים על ליקויים כלליים ו-10 שנים על ליקויי מבנה).</p>

<h2>שלב 4: בדיקות לפני החתימה</h2>
<p>לפני החתימה על החוזה, בצעו את הבדיקות הבאות: בדקו את יזם הפרויקט - היסטוריה, פרויקטים קודמים, ביקורות. הזמינו שמאי להערכת שווי הדירה. בקשו לראות את תשריט הדירה ואת המפרט הטכני המלא. בדקו את היתרי הבנייה ואת תוכנית המתאר של האזור. וודאו שהקבלן רשם הערת אזהרה לטובתכם בלשכת רישום המקרקעין.</p>

<h2>שלב 5: קבלת המפתחות</h2>
<p>ביום המסירה, הגיעו עם עורך דין ושמאי לבדוק את הדירה. בצעו בדק בית יסודי - בדקו את כל המערכות, האינסטלציה, החשמל, האיטום, החלונות, הדלתות, והגימורים. רשמו את כל הליקויים ודרשו מהקבלן לתקן אותם. רק לאחר שאתם מרוצים, חתמו על פרוטוקול המסירה וקבלו את המפתחות.</p>
<p>מזל טוב! הדירה החדשה שלכם מחכה לכם.</p>`,
  `<h2>Step 1: Define a Realistic Budget</h2>
<p>Before starting your search for a new apartment, the first and most important step is setting a clear budget. Consider not just the apartment price itself, but also the associated costs: 18% VAT on new apartments (except for price-targeted apartments), purchase taxes (ranging from 0% to 10% depending on price), attorney fees (typically 0.5%-1% of the purchase price), broker fees (if applicable), and additional costs like appraisers, home inspections, and potential renovations.</p>
<p>It's recommended to get a preliminary mortgage approval from your bank before starting your search. Check how much you can afford considering the monthly payment, current interest rates, and loan period. Remember that Israeli mortgages are typically divided into several tracks - fixed interest, variable interest, and CPI-linked - and the right combination can save you tens of thousands of shekels.</p>

<h2>Step 2: Find the Right Project</h2>
<p>Finding your dream apartment starts with identifying your preferred area. Consider factors like proximity to work, educational institutions, public transportation, community services, and future development plans. MLS Israel aggregates new projects from across the country in one place, so you can filter by city, price range, property type, and project status.</p>
<p>When visiting a project, pay attention to build quality, materials used, the developer's and contractor's reputation, and payment terms. Check the developer's previous projects and visit them to assess the finish quality. Don't hesitate to ask questions about infrastructure, warranty on construction defects, and customization options.</p>

<h2>Step 3: Understand the Contract Terms</h2>
<p>A purchase contract for a new apartment from a developer includes many important clauses. One of the most important is the delivery timeline - the developer commits to deliver by a certain date, but often there's a liquidated damages clause for delays. Understand the terms and make sure they are fair.</p>
<p>Other important clauses include: technical specifications (what's included and what's not), payment terms (typically 8-10 payments over the construction period), right to receive contractor loans, and warranty on construction defects (2 years for general defects and 10 years for structural defects).</p>

<h2>Step 4: Inspections Before Signing</h2>
<p>Before signing the contract, perform these checks: research the developer - history, previous projects, reviews. Order an appraiser to assess the apartment's value. Request to see the apartment plan and full technical specifications. Check the building permits and the area's master plan. Make sure the developer registers a caveat in your favor at the Land Registry Office.</p>

<h2>Step 5: Receiving the Keys</h2>
<p>On delivery day, arrive with an attorney and appraiser to inspect the apartment. Perform a thorough home inspection - check all systems, plumbing, electricity, waterproofing, windows, doors, and finishes. Document all defects and demand the contractor fix them. Only after you are satisfied, sign the delivery protocol and receive the keys.</p>
<p>Congratulations! Your new apartment awaits you.</p>`,
  "",
  "2026-07-14"
);

// Article 2: Tel Aviv 2026
db.prepare(`INSERT INTO blog_posts (id, slug, title, excerpt, content_he, content_en, image_url, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
  "a2",
  "new-construction-projects-tel-aviv-2026",
  "פרויקטים חדשים בתל אביב 2026 - סקירה מקיפה",
  "סקירה של פרויקטי הבנייה החדשים המבטיחים ביותר בתל אביב לשנת 2026. מחירים, מיקומים, לוחות זמנים והזדמנויות השקעה.",
  `<h2>מגדל היובל - מגדל יוקרה בלב העיר</h2>
<p>אחד הפרויקטים הבולטים בתל אביב הוא מגדל היובל, מגדל יוקרתי בן 35 קומות בלב תל אביב. הפרויקט מציע דירות נוף לים, פנטהאוזים מרהיבים עם גג פרטי, בריכת שחייה, חדר כושר, ומתחם ספא. המחירים נעים בין 2.5 ל-5.8 מיליון ש"ח, תלוי בקומה, גודל הדירה והנוף.</p>
<p>היזם הוא אחת מחברות הבנייה המובילות בישראל עם רקורד של פרויקטים איכותיים. המסירה צפויה ברבעון השלישי של 2026. דירות 3-5 חדרים, דופלקסים ופנטהאוזים.</p>

<h2>מתחם פלורנטין - התחדשות עירונית</h2>
<p>שכונת פלורנטין ממשיכה להתחדש עם מספר פרויקטים חדשים. המתחם החדש ברחוב הרצל מציע דירות קטנות יחסית (2-4 חדרים) במחירים שנעים בין 1.8 ל-3.2 מיליון ש"ח, מושלם למשקיעים ולזוגות צעירים. המיקום מצוין - במרחק הליכה מהשוק, מהתחנה המרכזית החדשה ומחוף הים.</p>
<p>הפרויקטים בפלורנטין מאופיינים בעיצוב מודרני, חללים פתוחים, גגות ירוקים ושטחים ציבוריים איכותיים. זוהי אחת השכונות הצומחות ביותר בתל אביב.</p>

<h2>הצפון הישן - נדל"ן יוקרתי</h2>
<p>הצפון הישן ממשיך להיות אחד האזורים המבוקשים בתל אביב. פרויקט חדש ברחוב בן יהודה מציע דירות יוקרה בגדלים של 4-6 חדרים, במחירים הנעים בין 4 ל-8 מיליון ש"ח. הפרויקט כולל חניה תת קרקעית, מחסן, מרפסת שמש רחבה, ונוף לים.</p>
<p>באזור רחוב הירקון יש פרויקט התחדשות של מלון ישן שהוסב למגורי יוקרה, עם דירות נוף מרהיבות לקו החוף ולפארק הירקון.</p>

<h2>נווה צדק - ביקוש גבוה תמידי</h2>
<p>נווה צדק, אחת השכונות היקרות והיוקרתיות בתל אביב, מציעה פרויקטים בוטיקיים עם אופי מיוחד. פרויקט ברחוב שבטי ישראל כולל 15 דירות יוקרה בסגנון המשלב עיצוב מודרני עם שימור האופי ההיסטורי של השכונה. המחירים נעים בין 5 ל-12 מיליון ש"ח.</p>

<h2>המלצות למשקיעים</h2>
<p>שוק הנדל"ן בתל אביב ממשיך לצמוח, עם ביקוש גבוה לדירות חדשות. למרות המחירים הגבוהים, תל אביב נחשבת לאחת מערי ההשקעה המבטיחות בישראל. מומלץ לשים לב לפרויקטים בשלבי תכנון מוקדמים (פריסייל) שבהם המחירים נמוכים יותר, ולהיזהר מפרויקטים ללא אישורי בנייה מלאים.</p>`,
  `<h2>Migdal HaYovel - Luxury Tower in the City Center</h2>
<p>One of Tel Aviv's most prominent projects is Migdal HaYovel, a luxurious 35-story tower in the heart of Tel Aviv. The project offers sea-view apartments, spectacular penthouses with private rooftop, swimming pool, gym, and spa complex. Prices range from 2.5 to 5.8 million ILS, depending on floor, apartment size, and view.</p>
<p>The developer is one of Israel's leading construction companies with a track record of quality projects. Delivery is expected in Q3 2026. 3-5 room apartments, duplexes, and penthouses available.</p>

<h2>Florentin Complex - Urban Renewal</h2>
<p>The Florentin neighborhood continues to renew itself with several new projects. The new complex on Herzl Street offers relatively small apartments (2-4 rooms) at prices ranging from 1.8 to 3.2 million ILS, perfect for investors and young couples. The location is excellent - walking distance from the market, the new central station, and the beach.</p>
<p>Florentin projects feature modern design, open spaces, green roofs, and high-quality public areas. This is one of the fastest-growing neighborhoods in Tel Aviv.</p>

<h2>Old North - Luxury Real Estate</h2>
<p>The Old North continues to be one of Tel Aviv's most sought-after areas. A new project on Ben Yehuda Street offers luxury apartments in sizes of 4-6 rooms, with prices ranging from 4 to 8 million ILS. The project includes underground parking, storage, a large sun terrace, and sea views.</p>
<p>On Yarkon Street, a hotel conversion project is transforming an old hotel into luxury residences, with spectacular views of the coastline and Yarkon Park.</p>

<h2>Neve Tzedek - Consistently High Demand</h2>
<p>Neve Tzedek, one of Tel Aviv's most expensive and prestigious neighborhoods, offers boutique projects with a unique character. A project on Shevet Yisrael Street includes 15 luxury apartments blending modern design with preservation of the neighborhood's historic character. Prices range from 5 to 12 million ILS.</p>

<h2>Recommendations for Investors</h2>
<p>Tel Aviv's real estate market continues to grow, with high demand for new apartments. Despite the high prices, Tel Aviv is considered one of Israel's most promising investment cities. It's recommended to look at early-stage projects (pre-sale) where prices are lower, and to be cautious of projects without full building permits.</p>`,
  "",
  "2026-07-07"
);

// Article 3: Real Estate Investment Guide
db.prepare(`INSERT INTO blog_posts (id, slug, title, excerpt, content_he, content_en, image_url, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
  "a3",
  "guide-to-real-estate-investment-in-israel",
  'מדריך השקעות נדל"ן בישראל - הזדמנויות, סיכונים ואסטרטגיות',
  'כל מה שצריך לדעת על השקעה בנדל"ן ישראלי. יתרונות, סיכונים, אסטרטגיות השקעה שונות, וטיפים מעשיים למשקיעים מתחילים ומנוסים.',
  `<h2>למה להשקיע בנדל"ן ישראלי?</h2>
<p>שוק הנדל"ן הישראלי מציע מספר יתרונות ייחודיים למשקיעים. ראשית, הביקוש לדירות חדשות בישראל גבוה באופן קבוע - גידול אוכלוסין טבעי, עלייה, ומעבר של זוגות צעירים לערים המרכזיות יוצרים ביקוש יציב. שנית, מחירי הדיור בישראל הראו יציבות ועלייה מתמדת לאורך שנים, מה שהופך נדל"ן לאפיק השקעה סולידי יחסית. שלישית, הריבית במשק נמצאת במגמת ירידה, מה שהופך משכנתאות לזולות יותר ומגדיל את כוח הקנייה של הרוכשים.</p>
<p>ישראל נחשבת ל"מדינת סטארט-אפ" עם כלכלה חזקה וצומחת, תעסוקה גבוהה, ויציבות מקרו-כלכלית יחסית. כל אלה תורמים לשוק נדל"ן חזק ויציב.</p>

<h2>סוגי השקעות בנדל"ן</h2>
<h3>1. השקעה בדירה חדשה בפריסייל</h3>
<p>רכישת דירה בשלב התכנון או תחילת הבנייה מאפשרת להיכנס במחיר נמוך יותר (בדרך כלל 10-20% מתחת למחיר השוק במועד המסירה). היתרון המרכזי הוא עליית ערך פוטנציאלית משמעותית בתקופת הבנייה. החיסרון: הסיכון לעיכובים והצורך בהון עצמי גבוה ללא תזרים הכנסות עד המסירה.</p>

<h3>2. השקעה בנדל"ן מניב</h3>
<p>רכישת דירה או נכס מסחרי והשכרתו יוצרת תזרים שוטף מהשכרה. בישראל, התשואה על דירות להשכרה נעה בדרך כלל בין 2.5% ל-4% בתל אביב, ועד 5%-6% בערי הפריפריה. נכסים מסחריים ומשרדים יכולים להניב תשואות גבוהות יותר, אך עם סיכון גבוה יותר.</p>

<h3>3. קרקעות וקרנות השקעה</h3>
<p>השקעה בקרקעות לבנייה או בקרנות השקעה בנדל"ן (REITs) מאפשרת חשיפה לשוק הנדל"ן ללא הצורך בניהול ישיר של נכסים. קרנות כמו "קבוצת עזריאלי" ו"חברות ריט" מנפיקות מניות לציבור ומשקיעות בנדל"ן מניב.</p>

<h2>טיפים למשקיעים מתחילים</h2>
<p>בחרו מיקום אסטרטגי - מיקום הוא הגורם החשוב ביותר בהשקעת נדל"ן. חפשו אזורים עם תשתיות טובות, תחבורה ציבורית, מוסדות חינוך, ותוכניות פיתוח עתידיות. בדקו את היזם - חקרו את הרקורד של היזם והקבלן. פרויקטים קודמים, ביקורות בעלים, ומצב פיננסי. השתמשו במינוף חכם - משכנתא יכולה להגדיל את התשואה על ההשקעה, אך אל תיקחו סיכונים מיותרים. גוונו את ההשקעות - אל תשימו את כל הביצים בסל אחד. שקלו להשקיע במספר אזורים גיאוגרפיים ובסוגי נכסים שונים. היו סבלניים - השקעה בנדל"ן היא ארוכת טווח. אל תצפו לתשואות מיידיות.</p>

<h2>הזדמנויות השקעה ב-2026</h2>
<p>שנת 2026 מביאה עמה הזדמנויות חדשות בשוק הנדל"ן הישראלי. פרויקטים חדשים בערי הלוויין של גוש דן, התחדשות עירונית בערים ותיקות כמו רמת גן, גבעתיים, ופתח תקווה, ופרויקטים בפריפריה עם תמורות כלכליות (כמו באר שבע וצפת) מציעים פוטנציאל השקעה מעניין. מומלץ להיוועץ עם יועץ השקעות או שמאי לפני קבלת החלטות משמעותיות.</p>`,
  `<h2>Why Invest in Israeli Real Estate?</h2>
<p>The Israeli real estate market offers several unique advantages for investors. First, demand for new apartments in Israel is consistently high - natural population growth, immigration, and young couples moving to central cities create steady demand. Second, housing prices in Israel have shown stability and consistent growth over the years, making real estate a relatively solid investment avenue. Third, interest rates are trending downward, making mortgages cheaper and increasing buyers' purchasing power.</p>
<p>Israel is considered a "Startup Nation" with a strong and growing economy, high employment, and relative macroeconomic stability. All these contribute to a strong and stable real estate market.</p>

<h2>Types of Real Estate Investments</h2>
<h3>1. Investing in New Pre-sale Apartments</h3>
<p>Purchasing an apartment at the planning or early construction stage allows entry at a lower price (typically 10-20% below market price at delivery). The main advantage is significant potential appreciation during the construction period. The downside: risk of delays and the need for high equity without rental income until delivery.</p>

<h3>2. Income-Generating Real Estate</h3>
<p>Purchasing an apartment or commercial property and renting it out creates ongoing cash flow from rent. In Israel, rental yields on apartments typically range from 2.5% to 4% in Tel Aviv, and up to 5%-6% in peripheral cities. Commercial properties and offices can yield higher returns, but with higher risk.</p>

<h3>3. Land and Investment Funds</h3>
<p>Investing in building land or real estate investment funds (REITs) allows exposure to the real estate market without direct property management. Funds like "Azrieli Group" and REIT companies issue shares to the public and invest in income-generating real estate.</p>

<h2>Tips for Beginning Investors</h2>
<p>Choose a strategic location - location is the most important factor in real estate investment. Look for areas with good infrastructure, public transportation, educational institutions, and future development plans. Research the developer - investigate the developer's and contractor's track record, previous projects, owner reviews, and financial status. Use smart leverage - a mortgage can increase your return on investment, but don't take unnecessary risks. Diversify your investments - don't put all your eggs in one basket. Consider investing in multiple geographic areas and different property types. Be patient - real estate investment is long-term. Don't expect immediate returns.</p>

<h2>Investment Opportunities in 2026</h2>
<p>2026 brings new opportunities in the Israeli real estate market. New projects in the suburbs of the Dan region, urban renewal in established cities like Ramat Gan, Givatayim, and Petah Tikva, and projects in the periphery with economic potential (like Be'er Sheva and Safed) offer interesting investment potential. It's recommended to consult with an investment advisor or appraiser before making significant decisions.</p>`,
  "",
  "2026-07-10"
);

console.log("All 3 blog articles updated with detailed content!");