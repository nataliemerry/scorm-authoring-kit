/* QA for C12 Penguatan Statistik Sektoral: tests video, hotspot, question set, DnD, and native quiz. */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../../exelearning/pilot', process.argv.includes('--dev') ? 'dev-preview' : 'preview');
const out = path.resolve(__dirname, '../../exelearning/pilot/qa');
fs.mkdirSync(out, { recursive: true });

const server = require('./local-server.cjs')(root);
let browser;
const report = { checks: [], screenshots: [] };

function mock() {
  window.lms = { values: { 'cmi.core.lesson_status': 'not attempted' }, calls: [] };
  window.API = {
    LMSInitialize: () => 'true',
    LMSGetValue: k => window.lms.values[k] || (k.endsWith('_count') ? '0' : ''),
    LMSSetValue: (k, v) => {
      window.lms.values[k] = v;
      window.lms.calls.push([k, v]);
      return 'true';
    },
    LMSCommit: () => 'true',
    LMSFinish: () => 'true',
    LMSGetLastError: () => '0',
    LMSGetErrorString: () => '',
    LMSGetDiagnostic: () => ''
  };
}

async function shot(p, n) {
  await p.evaluate(() => document.fonts.ready);
  assert.equal(await p.locator('.scene-chrome-right > .scene-fullscreen').count(), 1);
  assert.equal(await p.locator('.scene-chrome-right > .ite-settings-open').count(), 1);
  const logo = p.locator('.scene-brand-logo');
  assert.equal(await logo.count(), 1);
  assert(await logo.isVisible());
  assert(await logo.evaluate(e => e.complete && e.naturalWidth === 958 && e.naturalHeight === 980), 'Logo BPS CorpU original');
  
  // Verify no raw HTML tag leaks anywhere in visible text
  const rawHtmlLeaks = await p.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const leaks = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.parentElement || node.parentElement.closest('script, style, noscript, [hidden]')) continue;
      if (/<[a-z][\s\S]*>/i.test(node.nodeValue)) {
        leaks.push({ text: node.nodeValue.trim(), parent: node.parentElement.tagName });
      }
    }
    return leaks;
  });
  assert.deepEqual(rawHtmlLeaks, [], 'No raw HTML tags in visible DOM: ' + JSON.stringify(rawHtmlLeaks));
  
  await p.screenshot({ path: path.join(out, n), animations: 'disabled' });
  if (!report.screenshots.includes(n)) report.screenshots.push(n);
}

async function testVideo(p) {
  assert(await p.locator('.iv-root').isVisible());
  const beforeScore = await p.evaluate(() => window.lms?.values?.['cmi.core.score.raw'] || null);
  await p.waitForFunction(() => document.querySelector('.iv-video')?.duration >= 89 && document.querySelector('.iv-video')?.duration <= 91);
  
  const cfg = await p.locator('.iv-config').evaluate(e => JSON.parse(e.textContent));
  assert.equal(cfg.interactions.length, 3);
  assert(cfg.hasAudio);
  
  // Play and timeline seek
  await p.locator('.iv-play').click();
  await p.waitForFunction(() => document.querySelector('.iv-video').currentTime > 0.05);
  await p.locator('.iv-play').click();
  
  // Mute / unmute
  await p.locator('.iv-mute').click();
  assert(await p.locator('.iv-video').evaluate(e => e.muted));
  await p.locator('.iv-mute').click();
  assert.equal(await p.locator('.iv-video').evaluate(e => e.muted), false);
  
  await shot(p, 'C12-interactive-video.png');
  
  // Test interaction checkpoints
  for (let i = 0; i < cfg.interactions.length; i++) {
    await p.locator(`[data-iv-marker="${i}"]`).click();
    assert(await p.locator('.iv-question').isVisible());
    // Select correct option
    await p.locator('input[name="iv-answer"]').nth(cfg.interactions[i].correct).check();
    await p.locator('.iv-check').click();
    assert((await p.locator('.iv-feedback').innerText()).includes('tepat'));
    if (i === 1) await shot(p, 'C12-video-question.png');
    await p.locator('.iv-resume').click();
  }
  
  // Finish video -> advance to situations
  await p.locator('.iv-finish').click();
  assert(await p.locator('.sim-root').isVisible());
  assert.equal(await p.evaluate(() => window.lms?.values?.['cmi.core.score.raw'] || null), beforeScore);
  report.checks.push('Video 90s with 3 checkpoints passes and does not modify LMS score');
}

async function testHotspotAndConcept(p) {
  // We navigate through situations, word search, drag words, sort paragraphs to reach hotspot
  // 1. Situations
  for (let i = 0; i < 2; i++) {
    await p.locator('[data-simple-choice="0"]').click();
    await p.locator('[data-simple-sim="next"]').click();
  }
  // 2. Word search
  assert(await p.locator('.word-root').isVisible());
  await p.locator('[data-word-action="continue"]').click();
  // 3. Drag words
  assert(await p.locator('.dt-root').isVisible());
  await p.locator('[data-dt-action="continue"]').click();
  // 4. Sort paragraphs
  assert(await p.locator('.sp-root').isVisible());
  await p.locator('[data-sp-action="continue"]').click();
  
  // 5. Hotspot
  assert(await p.locator('.hotspot-root').isVisible());
  assert(await p.locator('[data-ite-next="checkpoint"]').isDisabled());
  const expectedLabels = ['Standar Data', 'Metadata Statistik', 'Interoperabilitas Data', 'Format Tertutup'];
  assert.deepEqual(await p.locator('.hotspot-caption').allTextContents(), expectedLabels);
  
  await shot(p, 'C12-hotspot-labels.png');
  
  // Click correct 3 regions
  for (const id of ['standar-data', 'metadata', 'interoperabilitas']) {
    await p.locator(`.hotspot-list [data-hotspot="${id}"]`).click();
  }
  assert.equal(await p.locator('.hotspot-root').getAttribute('data-complete'), 'true');
  assert(await p.locator('[data-ite-next="checkpoint"]').isEnabled());
  await shot(p, 'C12-hotspot-complete.png');
  await p.locator('[data-ite-next="checkpoint"]').click();
  
  // 6. Concept question set
  assert(await p.locator('.quiz-set-root').isVisible());
  assert(await p.locator('[data-ite-next="case"]').isDisabled());
  const qCfg = await p.locator('.quiz-set-config').evaluate(e => JSON.parse(e.textContent));
  assert.equal(qCfg.questions.length, 3);
  for (let i = 0; i < qCfg.questions.length; i++) {
    await p.locator('.quiz-card input').nth(qCfg.questions[i].correct).check();
    await p.locator('.quiz-next').click();
  }
  assert.equal(await p.locator('.quiz-set-root').getAttribute('data-complete'), 'true');
  assert.equal(await p.locator('.quiz-set-root').getAttribute('data-scorm-saved'), 'false');
  assert(await p.locator('[data-ite-next="case"]').isEnabled());
  await shot(p, 'C12-question-set-complete.png');
  await p.locator('[data-ite-next="case"]').click();
  
  report.checks.push('Hotspot and question set pass with correct labels and ungraded state');
}

async function testCaseAndQuiz(p) {
  assert(await p.locator('.dnd-challenge').isVisible());
  // Step 1: solution and advance
  assert.equal(await p.locator('[data-dnd-action="solution"]').count(), 1);
  await p.locator('[data-dnd-action="solution"]').click();
  await p.locator('[data-dnd-action="check"]').click(); // validate step 0
  await p.locator('[data-dnd-action="check"]').click(); // enter step 1
  
  // Step 2: solution and validate final step
  await p.locator('[data-dnd-action="solution"]').click();
  await p.locator('[data-dnd-action="check"]').click(); // validate step 1
  assert.equal(await p.locator('.dnd-challenge').getAttribute('data-complete'), 'true');
  
  // Move to quiz
  await p.locator('.scene-next').click();
  assert.equal(await p.getAttribute('body', 'data-scene-phase'), '2');
  
  // Answer native 2 questions correctly (Q1 key A -> index 0; Q2 key B -> index 1)
  await p.locator('.FRMP-SlideshowSlide[data-slide="0"] input').nth(0).check();
  await p.locator('.FRMP-SlideshowNext').click();
  await p.locator('.FRMP-SlideshowSlide[data-slide="1"] input').nth(1).check();
  
  // Advance to review
  await p.locator('.scene-next').click();
  assert.equal(await p.getAttribute('body', 'data-scene-phase'), '3');
  await shot(p, 'C12-review.png');
  
  // Advance to result
  await p.locator('.scene-next').click();
  assert.equal(await p.getAttribute('body', 'data-scene-phase'), '4');
  await shot(p, 'C12-result.png');
  
  assert.equal(await p.evaluate(() => window.lms.values['cmi.core.score.raw']), '100');
  assert.equal(await p.evaluate(() => window.lms.values['cmi.core.lesson_status']), 'passed');
  report.checks.push('Case challenge solution button and native 2-question quiz pass with score 100');
}

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/C12/index.html`;
  
  browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--disable-gpu'] });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx.addInitScript(mock);
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  
  await p.goto(url);
  await shot(p, 'C12-cover.png');
  
  // Open settings dialog and check
  await p.locator('.ite-settings-open').click();
  assert.equal(await p.locator('.ite-settings-page input:checked').count(), 11);
  await shot(p, 'C12-settings-modal.png');
  await p.locator('.ite-settings-cancel').click();
  
  // Begin course
  await p.locator('.lesson-open').click();
  // Theory lessons
  for (let i = 0; i < 2; i++) {
    await p.locator('[data-lesson-action="next"]').click();
  }
  // Check understanding
  await p.locator('input[name="lesson-answer"][value="0"]').check();
  await p.locator('.simple-check-button').click();
  await p.locator('.scene-free').click();
  
  // Phase 1 activities
  await testVideo(p);
  await testHotspotAndConcept(p);
  await testCaseAndQuiz(p);
  
  assert.deepEqual(errors, [], 'No uncaught page errors: ' + errors.join('; '));
  console.log('ALL C12 CHECKS PASSED SUCCESSFULLY!');
})().catch(e => {
  report.failure = e.stack;
  process.exitCode = 1;
  console.error(e);
}).finally(async () => {
  fs.writeFileSync(path.join(out, 'c12-experience-report.json'), JSON.stringify(report, null, 2));
  if (browser) await browser.close();
  server.close();
});
