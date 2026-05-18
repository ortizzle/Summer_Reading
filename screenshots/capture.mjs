import puppeteer from 'puppeteer-core';

const BASE = 'http://localhost:4401';
const OUT = '/Users/christopher_ortiz/Downloads/projects/Summer_Reading/screenshots';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const wait = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

// Pre-set localStorage: device member + a minimal onboarded state
await page.evaluateOnNewDocument(() => {
  localStorage.setItem('ak26-device-member', 'chris');
  const fakeState = {
    onboarded: { chris: true, kat: true, sedona: true, river: true, hani: true },
    avatars: { chris: '🐺', kat: '👩🏾', sedona: '👧🏾', river: '🌊', hani: '⭐' },
    books: { chris: [], kat: [], sedona: [], river: [], hani: [] },
    sessions: {},
    activity: [
      { id: 'a1', type: 'message', member: 'kat', text: 'Kat: @Chris good job 📖', ts: Date.now() - 86400000 },
      { id: 'a2', type: 'reading', member: 'chris', emoji: '📖', text: 'Chris logged 30 min of reading', ts: Date.now() - 3600000 }
    ],
    reactions: { a1: { '❤️': ['chris', 'sedona'], '💪': ['chris'] } },
    pins: {},
    journals: {},
    bingo: { kids: {}, adults: {} },
    badges: {},
    libraryVisits: {}
  };
  localStorage.setItem('ortizzle_local', JSON.stringify(fakeState));
});

await page.goto(BASE, { waitUntil: 'networkidle0' });
await wait(2500);

// Kill any overlays
await page.evaluate(() => {
  ['splash-screen', 'who-overlay', 'onboard-overlay', 'pin-overlay'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
});
await wait(600);

async function clickNav(idx) {
  await page.evaluate((i) => {
    const icons = document.querySelectorAll('.bottom-nav-icon');
    if (icons[i]) icons[i].click();
  }, idx);
  await wait(1000);
}

async function shot(name, fn) {
  await fn();
  await page.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 92 });
  console.log('✓', name);
}

await shot('01_home',     () => clickNav(0));
await shot('02_shelf',    () => clickNav(1));
await shot('03_log',      () => clickNav(2));
await shot('04_goals',    () => clickNav(3));
await shot('05_exchange', () => clickNav(5));

await browser.close();
console.log('All done.');
