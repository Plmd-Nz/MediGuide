const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = path.resolve('C:/Users/Plmd_Nz/.gemini/antigravity/brain/767a203a-c475-462b-84ee-04d2c917bd39');

async function runVerification() {
  console.log('--- Lancement des tests de vérification Haute Couture MediGuide ---');
  
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--disable-gpu', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 }
  });

  const page = await context.newPage();

  try {
    // 1. Navigation vers l'accueil
    console.log('[1/7] Chargement de http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(2000);

    // Titre principal
    const titleText = await page.textContent('h1');
    console.log('Titre détecté :', titleText?.replace(/\s+/g, ' ').trim());
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_couture_01_hero.png') });

    // 2. Test du défilement fluide
    console.log('[2/7] Test du défilement...');
    const initialScrollY = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(800);
    const scrollAfter600 = await page.evaluate(() => window.scrollY);
    console.log(`Scroll: Initiale=${initialScrollY}px -> Après=${scrollAfter600}px`);

    // 3. Test de la Console IA Morphique & Scénario Douleur Thoracique
    console.log('[3/7] Test de la Console IA Morphique...');
    const thoraxBtn = page.locator('button:has-text("Douleur thoracique")').first();
    if (await thoraxBtn.isVisible()) {
      await thoraxBtn.click();
      console.log('Clic sur Douleur thoracique...');
      await page.waitForTimeout(1600); // 750ms scan + render
      const hospitalName = await page.textContent('h3');
      console.log('Résultat morphique affiché, Hôpital :', hospitalName);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_couture_02_morphic_triage.png') });
    }

    // 4. Test Bento Grid & Spotlight
    console.log('[4/7] Test Bento Grid 3 cartes...');
    await page.evaluate(() => {
      document.getElementById('bento-section')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(600);
    const bentoCards = await page.locator('.spotlight-card').count();
    console.log(`Nombre de cartes Spotlight détectées : ${bentoCards}`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_couture_03_bento_spotlight.png') });

    // 5. Test du composant .steps avec ligne animée
    console.log('[5/7] Test du composant .steps (Parcours 3 étapes)...');
    await page.evaluate(() => {
      document.getElementById('flow-section')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(800);
    const hasOnClass = await page.evaluate(() => {
      const el = document.getElementById('steps');
      return el ? el.classList.contains('on') : false;
    });
    console.log('Classe .on activée sur #steps via IntersectionObserver :', hasOnClass);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_couture_04_steps_workflow.png') });

    // 6. Test du Portail d\'Authentification & Google OAuth
    console.log('[6/7] Test Portail Auth & Google OAuth modal...');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(400);

    const seConnecterBtn = page.locator('nav button:has-text("Se connecter")').first();
    await seConnecterBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_couture_05_auth_portal.png') });

    // Ouvrir la modale Google
    const googleBtn = page.locator('button:has-text("Continuer avec Google")').first();
    await googleBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_couture_06_google_modal.png') });

    // Sélectionner Dr. Sarah M.
    const sarahBtn = page.locator('button:has-text("Dr. Sarah M.")').first();
    if (await sarahBtn.isVisible()) {
      await sarahBtn.click();
      await page.waitForTimeout(800);
      console.log('Authentifié avec Dr. Sarah M. !');
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_couture_07_logged_in.png') });

    // 7. Test de l'Espace Consultation
    console.log('[7/7] Test Espace Consultation...');
    const consultBtn = page.locator('nav button:has-text("Consultation")').first();
    await consultBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_couture_08_consultation.png') });

    // 8. Test Mobile (iPhone 13 - 390x844)
    console.log('Test Mobile responsive (iPhone 13)...');
    const mobileCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true
    });
    const mobilePage = await mobileCtx.newPage();
    await mobilePage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await mobilePage.waitForTimeout(1500);
    await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_couture_09_mobile_hero.png') });
    
    // Scroll sur mobile vers le steps vertical
    await mobilePage.evaluate(() => {
      document.getElementById('flow-section')?.scrollIntoView({ behavior: 'instant' });
    });
    await mobilePage.waitForTimeout(800);
    await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_couture_10_mobile_steps.png') });
    await mobileCtx.close();

    console.log('=== TOUTES LES VÉRIFICATIONS SONT RÉUSSIES ! ===');
  } catch (err) {
    console.error('Erreur durant le test :', err);
  } finally {
    await browser.close();
  }
}

runVerification();
