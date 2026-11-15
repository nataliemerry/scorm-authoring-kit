/* Regression-test the existing extended Pengelolaan Data course without rewriting its content. */
const { chromium } = require('playwright');
const fs = require('node:fs'), path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const server = require('./local-server.cjs')(root);
const report = { checks: [] };
function mock() {
  window.lms = { values: { 'cmi.core.lesson_status': 'not attempted' }, calls: [] };
  window.API = {
    LMSInitialize: () => 'true',
    LMSGetValue: key => window.lms.values[key] || (key.endsWith('_count') ? '0' : ''),
    LMSSetValue: (key, value) => { window.lms.values[key] = value; window.lms.calls.push([key, value]); return 'true'; },
    LMSCommit: () => 'true', LMSFinish: () => 'true', LMSGetLastError: () => '0',
    LMSGetErrorString: () => '', LMSGetDiagnostic: () => ''
  };
}
async function learn(page) {
  await page.locator('.lesson-open').click();
  for (let i = 0; i < 2; i++) await page.locator('[data-lesson-action=next]').click();
  const cfg = await page.locator('.lesson-config').evaluate(e => JSON.parse(e.textContent));
  await page.locator('input[name=lesson-answer][value="' + cfg.lessons[2].correct + '"]').check();
  await page.locator('.simple-check-button').click();
  await page.locator('.scene-free').click();
}
async function video(page) {
  await page.waitForFunction(() => document.querySelector('.iv-video')?.duration > 420);
  const cfg = await page.locator('.iv-config').evaluate(e => JSON.parse(e.textContent));
  for (const [index, q] of cfg.interactions.entries()) {
    await page.locator('[data-iv-marker="' + index + '"]').click();
    await page.locator('input[name=iv-answer][value="' + q.correct + '"]').check();
    await page.locator('.iv-check').click();
    await page.locator('.iv-resume').click();
  }
  await page.locator('.iv-finish').click();
  assert(await page.locator('.sim-root').isVisible());
}
async function practice(page) {
  for (let i = 0; i < 2; i++) {
    await page.locator('[data-simple-choice="0"]').click();
    await page.locator('[data-simple-sim=next]').click();
  }
  assert(await page.locator('.word-root').isVisible());
  for (const name of ['word', 'dt', 'sp']) {
    await page.locator('[data-' + name + '-action=continue]').click();
  }
  const cfg = await page.locator('.hotspot-config').evaluate(e => JSON.parse(e.textContent));
  const wrong = cfg.regions.find(r => !r.correct);
  await page.locator('.hotspot-list [data-hotspot="' + wrong.id + '"]').click();
  assert.notEqual(await page.locator('.dnd-challenge').getAttribute('data-complete'), 'true');
  for (const r of cfg.regions.filter(r => r.correct)) {
    const button = page.locator('.hotspot-list [data-hotspot="' + r.id + '"]');
    await button.focus(); await button.press('Enter');
  }
  assert.equal(await page.locator('.dnd-challenge').getAttribute('data-complete'), 'true');
  await page.locator('.scene-next').click();
}
async function quiz(page, score) {
  const cfg = await page.locator('.quiz-set-config').evaluate(e => JSON.parse(e.textContent));
  await page.locator('.quiz-next').click(); await page.locator('.quiz-next').click();
  assert(await page.locator('.quiz-alert').innerText());
  await page.locator('[data-quiz-jump="0"]').click();
  for (const [index, q] of cfg.questions.entries()) {
    const value = score === 100 || (score === 50 && index === 0) ? q.correct : (q.correct + 1) % q.options.length;
    await page.locator('.quiz-set-app input[value="' + value + '"]').check();
    await page.locator('.quiz-check').click();
    await page.locator('.quiz-next').click();
  }
  assert.equal(await page.locator('.quiz-set-root').getAttribute('data-score'), String(score));
  assert.equal(await page.evaluate(() => window.lms.values['cmi.core.score.raw']), String(score));
  assert.equal(await page.evaluate(() => window.lms.values['cmi.core.lesson_status']), 'passed');
}
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const mobile of [false, true]) {
      const page = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1600, height: 1100 },
        hasTouch: mobile, isMobile: mobile });
      const errors = []; page.on('pageerror', e => errors.push(e.stack));
      await page.addInitScript(mock);
      await page.goto('http://127.0.0.1:' + server.address().port + '/pengelolaan-data/index.html');
      assert.equal(await page.locator('.scene-chrome').count(), 1);
      await learn(page); await video(page); await practice(page);
      for (const score of [50, 0, 100]) {
        await quiz(page, score);
        await page.locator('.quiz-retry').click();
        assert.equal(await page.locator('.quiz-set-root').getAttribute('data-complete'), 'false');
      }
      assert.deepEqual(errors, []);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.close();
      report.checks.push((mobile ? 'Mobile' : 'Desktop') + ' PD01: theory, four video questions, two situations, optional games navigation, hotspot wrong/correct keyboard, quiz blank guard, 0/50/100 native runtime persistence and retry');
    }
    console.log(JSON.stringify(report, null, 2));
  } catch (error) { report.failure = error.stack; throw error;
  } finally {
    await browser.close(); server.close();
    fs.writeFileSync(path.join(root, 'docs/integration/pengelolaan-data-report.json'), JSON.stringify(report, null, 2) + '\n');
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
