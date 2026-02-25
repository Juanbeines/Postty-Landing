const { chromium } = require('playwright');
const path = require('path');

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    await page.goto('https://tryholo.ai/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Wait for content to load (Framer/JS-heavy site)
    await page.waitForTimeout(5000);

    // Dismiss any modal popup (e.g. "Pick & Win")
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
    // Force-hide modals/overlays via JS if they block the content
    await page.evaluate(() => {
      const all = document.querySelectorAll('div, section, aside');
      all.forEach(el => {
        const text = (el.textContent || '').toLowerCase();
        if (text.includes('pick') && text.includes('win') && el.offsetParent && el.offsetWidth > 200) {
          el.style.setProperty('display', 'none', 'important');
        }
      });
    });
    await page.waitForTimeout(500);

    // Find and scroll to "How Our AI Marketing Tool Works" section
    const section = await page.locator('text=How Our AI Marketing Tool Works').first();
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'holo-steps-screenshots');
    const fs = require('fs');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Screenshot 1: Initial view of the section (likely steps 01 and maybe 02)
    await page.screenshot({ path: path.join(screenshotsDir, 'holo-steps-1.png'), fullPage: false });
    console.log('Screenshot 1 saved');

    // Scroll down to capture more steps
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, 'holo-steps-2.png'), fullPage: false });
    console.log('Screenshot 2 saved');

    // Scroll down more
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, 'holo-steps-3.png'), fullPage: false });
    console.log('Screenshot 3 saved');

    // Try to capture the full steps section as one element if possible
    const stepsSection = page.locator('text=How Our AI Marketing Tool Works').locator('..').locator('..');
    try {
      const box = await stepsSection.boundingBox();
      if (box) {
        await page.screenshot({ 
          path: path.join(screenshotsDir, 'holo-steps-full.png'),
          clip: { x: 0, y: box.y - 100, width: 1440, height: Math.min(box.height + 400, 2500) }
        });
        console.log('Full section screenshot saved');
      }
    } catch (e) {
      console.log('Could not capture full section:', e.message);
    }

    console.log('All screenshots saved to:', screenshotsDir);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
