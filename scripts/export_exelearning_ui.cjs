/* Export editable projects through the official eXeLearning browser UI. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const projectNames = process.argv.slice(2).filter(value => !value.startsWith('--'));
const appUrl = process.env.EXELEARNING_URL || 'http://127.0.0.1:8876/';
const projects = projectNames.length ? projectNames : ['authoring/baseline'];
const exportsLog = [];

async function exportSource(browser, project, filename) {
  const folder = path.join(root, project, 'exelearning/pilot');
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  try {
    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
    await page.locator('#dropdownFile').click();
    const choosing = page.waitForEvent('filechooser');
    await page.locator('#navbar-button-open-offline').click();
    await (await choosing).setFiles(path.join(folder, 'sources', filename));
    const modal = page.locator('.modal.show');
    const yes = modal.getByText('Yes', { exact: true });
    await yes.waitFor({ timeout: 45000 });
    await yes.click();
    await modal.waitFor({ state: 'hidden', timeout: 45000 });
    await page.waitForTimeout(1000);
    if (await page.locator('#dropdownFile').getAttribute('aria-expanded') !== 'true') {
      await page.locator('#dropdownFile').click();
    }
    await page.locator('#dropdownExportAsOffline').hover();
    if (!await page.locator('#navbar-button-exportas-scorm12').isVisible()) {
      await page.locator('#dropdownExportAsOffline').click();
    }
    const downloading = page.waitForEvent('download', { timeout: 90000 });
    await page.locator('#navbar-button-exportas-scorm12').click();
    const download = await downloading;
    const basename = filename === 'ITE_IT_Enterprise.elpx'
      ? 'IT_Enterprise_SCORM12.zip' : filename.replace(/\.elpx$/, '_SCORM12.zip');
    const destination = path.join(folder, 'dist_scorm', basename);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    await download.saveAs(destination);
    if (await download.failure()) throw new Error(await download.failure());
    exportsLog.push({ project, source: filename, output: basename,
      suggestedName: download.suggestedFilename(), application: appUrl,
      platform: 'Official eXeLearning 4.0.6 static browser UI', date: new Date().toISOString() });
    console.log('Exported', project, basename);
  } finally {
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const project of projects) {
      const sourceFolder = path.join(root, project, 'exelearning/pilot/sources');
      for (const filename of fs.readdirSync(sourceFolder).filter(name => name.endsWith('.elpx')).sort()) {
        await exportSource(browser, project, filename);
      }
    }
  } finally {
    await browser.close();
    const target = path.join(root, 'docs/integration/export-provenance.json');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const previous = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, 'utf8')) : [];
    const merged = new Map([...previous, ...exportsLog].map(item => [item.project + '/' + item.source, item]));
    fs.writeFileSync(target, JSON.stringify([...merged.values()], null, 2) + '\n');
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
