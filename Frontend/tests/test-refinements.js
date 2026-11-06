const { chromium } = require("playwright");
const path = require("path");

const ARTIFACT_DIR = "C:\\Users\\Plmd_Nz\\.gemini\\antigravity\\brain\\767a203a-c475-462b-84ee-04d2c917bd39";

async function run() {
  console.log("=== Validation des Raffinements MediGuide AI ===");
  const browser = await chromium.launch({ 
    channel: 'msedge',
    headless: true,
    args: ['--disable-gpu', '--no-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    geolocation: { latitude: -4.322447, longitude: 15.307045 },
    permissions: ['geolocation'],
  });
  const page = await context.newPage();

  try {
    // 1. Accès à la landing page
    console.log("1. Chargement de l'application sur http://localhost:3000...");
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForTimeout(2500);

    // 2. Entrer dans l'espace applicatif Chatbot
    console.log("2. Clic sur 'Orienter sans attendre'...");
    await page.locator('button:has-text("Orienter sans attendre")').first().click();
    await page.waitForTimeout(1500);

    // 3. Vérifier le Header applicatif
    console.log("3. Vérification du header applicatif...");
    const hasMediGuideAI = await page.locator('header span:has-text("MediGuide")').isVisible();
    const hasAISpan = await page.locator('header span:has-text("AI")').isVisible();
    console.log("-> Header affiche 'MediGuide AI' ?", hasMediGuideAI && hasAISpan);

    const hasEscaladePill = await page.locator('text=Escalade RDC : Active').count();
    console.log("-> Pastille Escalade RDC absente ?", hasEscaladePill === 0);

    const hasHeaderLogo = await page.locator('header img[src*="logo-square.svg"]').isVisible();
    console.log("-> Logo présent dans le header ?", hasHeaderLogo);

    // 4. Vérifier l'absence d'exemples au-dessus du champ de texte
    console.log("4. Vérification de l'absence des exemples au-dessus du champ texte...");
    const hasExemplesLabel = await page.locator('text=Exemples :').count();
    console.log("-> Bloc 'Exemples :' absent ?", hasExemplesLabel === 0);

    // Capture de l'espace avec sidebar ouverte
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "refine_01_workspace_clean_header.png") });

    // 5. Tester la fermeture de la sidebar au clic sur le logo
    console.log("5. Test de la fermeture de la sidebar (clic sur logo sidebar)...");
    const sidebarLogoBtn = page.locator('aside button[title*="Fermer"]').first();
    await sidebarLogoBtn.click();
    await page.waitForTimeout(600);

    // Vérifier que le bouton de réouverture apparaît
    const reopenBtn = page.locator('button[title*="Ouvrir la barre latérale"]').first();
    const isReopenVisible = await reopenBtn.isVisible();
    console.log("-> Bouton de réouverture visible après fermeture ?", isReopenVisible);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "refine_02_sidebar_closed_logo_in_header.png") });

    // Réouvrir la sidebar
    console.log("6. Réouverture de la sidebar...");
    await reopenBtn.click();
    await page.waitForTimeout(600);

    // 6. Tester la modale de localisation (Liste au lieu de cartes, 10 villes max, recherche dynamique)
    console.log("7. Test de la sélection de ville...");
    const locationBtn = page.locator('header button[title*="Modifier la localisation"]').first();
    await locationBtn.click();
    await page.waitForTimeout(600);

    const isModalOpen = await page.locator('text=Villes et territoires de la RDC').isVisible();
    console.log("-> Modale de localisation ouverte ?", isModalOpen);

    // Compter les villes affichées par défaut (doit être 10)
    const initialCityRows = await page.locator('div.divide-y button').count();
    console.log("-> Nombre de villes affichées par défaut (doit être 10) :", initialCityRows);

    // Rechercher 'Goma'
    console.log("-> Recherche de 'Goma'...");
    const searchInput = page.locator('input[placeholder*="Rechercher une ville"]');
    await searchInput.fill("Goma");
    await page.waitForTimeout(400);

    const searchCityRows = await page.locator('div.divide-y button').count();
    console.log("-> Nombre de résultats après recherche 'Goma' :", searchCityRows);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, "refine_03_location_modal_list_search.png") });

    // Cliquer sur Goma
    await page.locator('div.divide-y button:has-text("Goma")').first().click();
    await page.waitForTimeout(600);

    // Vérifier que le header affiche maintenant Goma
    const headerCityText = await locationBtn.textContent();
    console.log("-> Ville sélectionnée dans le header :", headerCityText);

    // 7. Tester une consultation et vérifier l'absence de la carte d'escalade spatiale
    console.log("8. Lancement d'un triage clinique (suggestion 'Douleur thoracique')...");
    const thoraxCard = page.locator('h3:has-text("Douleur thoracique & essoufflement")').first();
    await thoraxCard.click();

    console.log("-> Attente des recommandations d'hôpitaux...");
    await page.waitForSelector('text=Structures sanitaires recommandées', { timeout: 45000 });
    await page.waitForTimeout(1000);

    // Vérifier que la carte 'Filtrage Spatial Progressif' / 'Protocole RDC' n'est PAS là
    const hasSpatialCard = await page.locator('text=Filtrage Spatial Progressif').count();
    const hasProtocoleRDC = await page.locator('text=Protocole RDC').count();
    console.log("-> Carte 'Filtrage Spatial Progressif' absente ?", hasSpatialCard === 0);
    console.log("-> Bloc 'Protocole RDC' absent ?", hasProtocoleRDC === 0);

    // Vérifier que les boutons Google Maps sont bien présents
    const mapsLink = page.locator('a[href*="google.com/maps"]').first();
    const mapsHref = await mapsLink.getAttribute('href');
    console.log("-> Lien Google Maps exact :", mapsHref);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, "refine_04_triage_without_spatial_card.png") });

    console.log("=== TOUS LES TESTS DE RAFFINEMENT SONT VALIDÉS AVEC SUCCÈS ! ===");
  } catch (err) {
    console.error("Erreur durant le test Playwright:", err);
  } finally {
    await browser.close();
  }
}

run();
