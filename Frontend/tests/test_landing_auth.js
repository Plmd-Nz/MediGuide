const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runTest() {
  console.log("=== Lancement du test automatisé MediGuide Landing & Auth ===");
  const browser = await chromium.launch({
    headless: true,
    channel: 'msedge',
    args: ['--disable-gpu', '--no-sandbox', '--disable-software-rasterizer']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, 'test_screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const safeScreenshot = async (name) => {
    try {
      const p = path.join(screenshotsDir, name);
      await page.screenshot({ path: p, timeout: 10000 });
      console.log(`-> ${name} capturé.`);
    } catch (e) {
      console.warn(`[WARN] Screenshot ${name} ignoré : ${e.message}`);
    }
  };

  try {
    // 1. Accès à la Landing Page
    console.log("1. Navigation vers http://localhost:3000 ...");
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('text=MediGuide', { timeout: 15000 });
    await page.waitForTimeout(1000);
    await safeScreenshot('01_landing_hero.png');

    // 2. Tester le scénario interactif "Douleur thoracique & essoufflement"
    console.log("2. Clic sur le scénario 'Douleur thoracique & essoufflement'...");
    const scenarioBtn = page.locator('text=Douleur thoracique & essoufflement');
    await scenarioBtn.click();
    await page.waitForTimeout(1500);
    await safeScreenshot('02_scenario_triage.png');

    // 3. Section Bento Grid
    console.log("3. Défilement vers la Bento Grid...");
    const bentoSection = page.locator('#fonctionnalites');
    await bentoSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await safeScreenshot('03_bento_grid.png');

    // 4. Section Structures Sanitaires Proches
    console.log("4. Défilement vers les structures et test du filtre Pédiatrie...");
    const structuresSection = page.locator('#structures');
    await structuresSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    const pedBtn = page.locator('button:has-text("Pédiatrie")');
    await pedBtn.click();
    await page.waitForTimeout(600);
    await safeScreenshot('04_structures_pediatrie.png');

    // 5. Clic sur "Fiche d'orientation"
    console.log("5. Ouverture de la modale de fiche d'orientation...");
    const modalBtn = page.locator('button:has-text("Fiche d\'orientation")').first();
    await modalBtn.click();
    await page.waitForTimeout(600);
    await safeScreenshot('05_fiche_orientation_modal.png');

    // Fermer la modale
    const closeBtn = page.locator('button:has(svg.lucide-x)').first();
    await closeBtn.click().catch(() => page.keyboard.press('Escape'));
    await page.waitForTimeout(400);

    // 6. Navigation vers la Page d'Authentification (Split-screen)
    console.log("6. Clic sur 'Se connecter'...");
    const loginNavBtn = page.locator('button:has-text("Se connecter")').first();
    await loginNavBtn.click();
    await page.waitForTimeout(800);
    await safeScreenshot('06_auth_split_screen.png');

    // 7. Ouverture de la modale Google OAuth
    console.log("7. Clic sur 'Continuer avec Google'...");
    const googleBtn = page.locator('button:has-text("Continuer avec Google")');
    await googleBtn.click();
    await page.waitForTimeout(600);
    await safeScreenshot('07_google_oauth_modal.png');

    // 8. Sélection du compte Google "Alexandre K."
    console.log("8. Sélection du profil Alexandre K. ...");
    const accountBtn = page.locator('text=Alexandre K.');
    await accountBtn.click();
    await page.waitForTimeout(800);
    await safeScreenshot('08_logged_in_landing.png');

    // 9. Passage vers l'application de consultation IA
    console.log("9. Clic pour ouvrir l'Assistant IA...");
    const avatarBadge = page.locator('button:has-text("Alexandre K.")');
    await avatarBadge.click();
    await page.waitForTimeout(400);
    const openAssistantBtn = page.locator('button:has-text("Ouvrir l\'Assistant IA")');
    await openAssistantBtn.click();
    await page.waitForTimeout(1000);
    await safeScreenshot('09_app_workspace.png');

    // 10. Vérifier le bouton "Accueil" pour revenir à la Landing
    console.log("10. Clic sur 'Accueil' pour revenir à la Landing...");
    const accueilBtn = page.locator('button:has-text("Accueil")');
    await accueilBtn.click();
    await page.waitForTimeout(800);

    // 11. Basculer en Mode Clair
    console.log("11. Bascule en mode clair...");
    const themeBtn = page.locator('button[aria-label="Basculer thème"]');
    await themeBtn.click();
    await page.waitForTimeout(600);
    await safeScreenshot('10_landing_light_mode.png');

    console.log("=== TOUS LES TESTS ONT RÉUSSI AVEC SUCCÈS ===");
  } catch (err) {
    console.error("Erreur durant le test :", err);
    try {
      await page.screenshot({ path: path.join(screenshotsDir, 'error_state.png'), timeout: 5000 });
    } catch {}
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTest();
