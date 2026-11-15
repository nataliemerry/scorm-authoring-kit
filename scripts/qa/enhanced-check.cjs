/* Test optional interactions in Chrome using local media and a mock LMS registry. */
const { chromium } = require('playwright');
const fs = require('node:fs'), path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const asset = '/scorm-authoring-kit/scorm-exe-scenes/assets/enhanced-interactions/';
const sample = JSON.parse(fs.readFileSync(path.join(root, asset, 'enhanced-interactions.example.json'), 'utf8'));
const report = { checks: [] };
function mock() {
  window.records = {}; window.outcomes = [];
  window.exeScorm12 = {
    activities: { register: (id, data) => window.records[id] = data, update: (id, data) => window.records[id] = data },
    policy: { setScoreDetailed: value => { window.outcomes.push(value); return { requiredWritten: true }; },
      persistActivities() {}, recordActivityOutcome() {}, reconcilePendingActivities() {} },
    client: { isActive: () => true, commit: () => true }, setPageHasScoredActivities() {}
  };
}
function fixture() {
  const cfg = structuredClone(sample);
  cfg.interactive_video.source = '/pengelolaan-data/content/resources/video/pengelolaan-data.mp4';
  cfg.interactive_video.poster = '/pengelolaan-data/content/resources/scenes/PD01.png';
  cfg.image_hotspot.background = cfg.interactive_video.poster;
  const block = (host, selector, app, config, extra = '') =>
    '<section class="' + host + '" ' + extra + '><script class="' + selector +
    '" type="application/json">' + JSON.stringify(config).replace(/</g, '\\u003c') +
    '</script><div class="' + app + '"></div></section>';
  return '<!doctype html><meta charset="utf-8"><body class="exe-export">' +
    '<link rel="stylesheet" href="' + asset + 'enhanced-interactions.css">' +
    '<style>section{margin:16px auto;max-width:1000px}body{background:#eff2e8}button{min-height:44px}</style>' +
    block('iv-root', 'iv-config', 'iv-app', cfg.interactive_video) +
    '<section class="sim-root" hidden><button>Continue</button></section>' +
    block('hotspot-root', 'hotspot-config', 'hotspot-app', cfg.image_hotspot) +
    block('quiz-set-root', 'quiz-set-config', 'quiz-set-app', cfg.question_set, 'data-renderer="lcm-question-set"') +
    '<script src="' + asset + 'enhanced-interactions.js"></script>';
}
const server = require('./local-server.cjs')(root, { '/fixture': fixture });
async function video(page) {
  await page.waitForFunction(() => document.querySelector('.iv-video')?.duration > 420);
  assert(await page.locator('.iv-finish').isHidden());
  await page.locator('.iv-timeline').focus();
  await page.locator('.iv-timeline').press('Home');
  await page.locator('.iv-timeline').press('ArrowRight');
  assert(await page.locator('.iv-video').evaluate(video => video.currentTime >= 4));
  await page.locator('.iv-volume').focus();await page.locator('.iv-volume').press('Home');
  assert(await page.locator('.iv-video').evaluate(video => video.muted));
  await page.locator('.iv-volume').press('End');
  assert(await page.locator('.iv-video').evaluate(video => !video.muted));

  const cfg = await page.locator('.iv-config').evaluate(e => JSON.parse(e.textContent));
  for (const [index, question] of cfg.interactions.entries()) {
    await page.locator('[data-iv-marker="' + index + '"]').click();
    await page.locator('input[name=iv-answer][value="' + question.correct + '"]').check();
    await page.locator('.iv-check').click();
    assert(await page.locator('.iv-feedback').isVisible());
    await page.locator('.iv-resume').click();
  }
  await page.locator('.iv-finish').click();
  assert.equal(await page.locator('.iv-root').getAttribute('data-complete'), 'true');
  assert(await page.locator('.sim-root').isVisible());
}
async function quiz(page, score) {
  const cfg = await page.locator('.quiz-set-config').evaluate(e => JSON.parse(e.textContent));
  for (let index = 0; index < cfg.questions.length; index++) {
    const right = score === 100 || (score === 50 && index === 0), q = cfg.questions[index];
    const value = right ? q.correct : (q.correct + 1) % q.options.length;
    await page.locator('.quiz-set-app input[type=radio][value="' + value + '"]').check();
    await page.locator('.quiz-next').click();
  }
  assert.equal(await page.locator('.quiz-set-root').getAttribute('data-score'), String(score));
  assert.equal(await page.locator('.quiz-set-root').getAttribute('data-complete'), 'true');
}
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const mobile of [false, true]) {
      const page = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1600, height: 1100 },
        hasTouch: mobile, isMobile: mobile });
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(mock); await page.goto(base + '/fixture'); await video(page);
      await page.locator('.hotspot-list [data-hotspot=area-2]').click();
      assert.notEqual(await page.locator('.hotspot-root').getAttribute('data-complete'), 'true');
      await page.locator('.hotspot-list [data-hotspot=area-1]').focus();
      await page.locator('.hotspot-list [data-hotspot=area-1]').press('Enter');
      assert.equal(await page.locator('.hotspot-root').getAttribute('data-complete'), 'true');
      await page.locator('.hotspot-retry').click();
      assert.equal(await page.locator('.hotspot-root').getAttribute('data-complete'), 'false');
      await page.locator('.quiz-next').click(); await page.locator('.quiz-next').click();
      assert(await page.locator('.quiz-alert').innerText()); await page.locator('.quiz-prev').click();
      await quiz(page, 50); await page.locator('.quiz-retry').click();
      assert.equal(await page.evaluate(() => window.records['course-question-set-v1'].completed), false);
      assert.equal(await page.locator('.quiz-set-root').getAttribute('data-scorm-saved'), 'false');
      for (const score of [0, 100]) {
        await quiz(page, score);
        assert.equal(await page.locator('.quiz-set-root').getAttribute('data-scorm-saved'), 'true');
        await page.locator('.quiz-retry').click();
      }
      assert.deepEqual(errors, []);
      report.checks.push((mobile ? 'Mobile' : 'Desktop') + ' extension: real video metadata, keyboard seek/volume and four marker questions, hotspot keyboard and retry, blank guard, score 0/50/100 and registry reset');
      await page.close();
    }
    const inactive = await browser.newPage();
    await inactive.addInitScript(mock);
    await inactive.addInitScript(() => { window.exeScorm12.client.isActive = () => false; });
    await inactive.goto(base + '/fixture');
    await quiz(inactive, 100);
    assert.equal(await inactive.locator('.quiz-set-root').getAttribute('data-scorm-saved'), 'false');
    assert.deepEqual(await inactive.evaluate(() => window.outcomes), []);
    await inactive.close();
    report.checks.push('Inactive LMS shows the result without claiming a successful save');
    console.log(JSON.stringify(report, null, 2));
  } catch (error) { report.failure = error.stack; throw error;
  } finally {
    await browser.close(); server.close();
    const out = path.join(root, 'docs/integration/enhanced-report.json');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
