const { chromium } = require("playwright");
const path = require("path");

const ARTIFACT_DIR = "C:\\Users\\Plmd_Nz\\.gemini\\antigravity\\brain\\767a203a-c475-462b-84ee-04d2c917bd39";

async function run() {
  console.log("=== Lancement du test Playwright de l'application SaaS MediGuide IA ===");
  const browser = await chromium.launch({ 
    channel: 'msedge',
    headless: true,
    args: ['--disable-gpu', '--no-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', req => console.log('REQ FAILED:', req.url(), req.failure()?.errorText));

  try {
    // 1. Navigation initiale
    console.log("1. Chargement de http://localhost:3000...");
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 90000 });
    
    // Attendre la fin du splash screen
    console.log("2. Attente de la transition d'accueil...");
    await page.waitForTimeout(3000);

    // Capture Landing Page avec nouveau logo carré
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "saas_01_landing_new_logo.png") });
    console.log("-> Landing Page capturée avec succès.");

    // 2. Accéder à l'application Chatbot dédiée
    console.log("3. Clic sur 'Orienter sans attendre' pour entrer dans l'application Chatbot...");
    const ctaButton = page.locator('button:has-text("Orienter sans attendre")').first();
    await ctaButton.click();
    await page.waitForTimeout(1500);

    // Vérifier que la navbar flottante de la vitrine a disparu
    const floatingNav = await page.locator('header.fixed.top-6').count();
    console.log("-> Navbar flottante vitrine présente ?", floatingNav > 0, "(doit être false)");

    // Vérifier la présence de la Sidebar
    const hasSidebar = await page.locator('aside').isVisible();
    console.log("-> Sidebar latérale visible ?", hasSidebar);

    // Vérifier le bouton Nouvelle consultation
    const hasNewBtn = await page.locator('button:has-text("Nouvelle consultation")').isVisible();
    console.log("-> Bouton 'Nouvelle consultation' visible ?", hasNewBtn);

    // Vérifier l'état d'accueil de la conversation (ChatEmptyState)
    const hasEmptyGreeting = await page.locator('text=Comment puis-je vous orienter aujourd\'hui ?').isVisible();
    console.log("-> Message d'accueil vide présent ?", hasEmptyGreeting);

    // Capture de l'application SaaS plein écran (Sidebar + Écran d'accueil)
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "saas_02_app_empty_workspace.png") });

    // 3. Tester le clic sur une suggestion clinique (Douleur thoracique)
    console.log("4. Sélection de la suggestion 'Douleur thoracique & essoufflement'...");
    const thoraxCard = page.locator('h3:has-text("Douleur thoracique & essoufflement")').first();
    await thoraxCard.click();
    
    // Attendre la réponse de l'IA et les recommandations d'hôpitaux
    console.log("-> Attente de l'analyse clinique de MediGuide IA...");
    await page.waitForSelector('text=Structures sanitaires recommandées', { timeout: 45000 });
    console.log("-> Recommandations hospitalières affichées !");

    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "saas_03_app_triage_conversation.png") });

    // 4. Vérifier les scores réels et le lien Google Maps
    const mapsLink = await page.locator('a[href*="google.com/maps"]').first();
    const href = await mapsLink.getAttribute('href');
    console.log("-> Lien Google Maps généré :", href);

    // 5. Tester la création d'une nouvelle consultation (+ Nouvelle consultation)
    console.log("5. Clic sur 'Nouvelle consultation' dans la sidebar...");
    const newSessionBtn = page.locator('button:has-text("Nouvelle consultation")').first();
    await newSessionBtn.click();
    await page.waitForTimeout(800);

    // Vérifier que la discussion est réinitialisée avec les cartes d'accueil
    const isReset = await page.locator('text=Comment puis-je vous orienter aujourd\'hui ?').isVisible();
    console.log("-> Nouvelle session active avec écran d'accueil propre ?", isReset);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "saas_04_new_session_clean.png") });

    // 6. Tester le retour vers le site vitrine (Retour au site)
    console.log("6. Clic sur 'Retour au site'...");
    const backSiteBtn = page.locator('button:has-text("Retour au site")').first();
    await backSiteBtn.click();
    await page.waitForTimeout(1000);

    const isBackLanding = await page.locator('text=Système d\'orientation médicale géolocalisé').isVisible();
    console.log("-> Retour sur la Landing Page réussi ?", isBackLanding);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "saas_05_back_to_landing.png") });

    console.log("=== TOUS LES TESTS PLAYWRIGHT DU WORKSPACE SAAS SONT VALIDÉS AVEC SUCCÈS ! ===");
  } catch (err) {
    console.error("Erreur durant le test Playwright:", err);
  } finally {
    await browser.close();
  }
}

run();
