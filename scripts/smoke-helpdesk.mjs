import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:4324';

const checks = [];
function ok(name, cond, detail = '') {
  checks.push({ name, ok: Boolean(cond), detail });
}

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));

async function gotoStable(url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
}

// 1. EN homepage: launcher visible after hydration
await gotoStable(`${BASE}/`);
const launcher = page.locator('button[aria-label="Need help?"]');
await launcher.waitFor({ state: 'visible', timeout: 10000 });
ok('EN launcher visible', true);

// 2. Open panel, see search input
await launcher.click();
const searchInput = page.locator('input[placeholder="Ask anything…"]');
await searchInput.waitFor({ state: 'visible', timeout: 5000 });
ok('EN panel opens with search input', true);

// 3. Click "Open a ticket" → form shows email field
await page.getByRole('button', { name: 'Open a ticket →' }).click();
const emailField = page.locator('input[type="email"]').first();
await emailField.waitFor({ state: 'visible', timeout: 5000 });
ok('Ticket form renders email field', true);

// 4. Submit empty form → validation error appears
await page.getByRole('button', { name: 'Submit' }).click();
const emailErr = page.getByText('Email is required');
await emailErr.waitFor({ state: 'visible', timeout: 3000 });
ok('Validation triggers on empty submit', true);

// 5. Close panel via aria-label
await page.locator('button[aria-label="Close"]').first().click();
await page.waitForTimeout(200);
ok('Panel closes', !(await searchInput.isVisible()));

// 6. KO homepage: Korean aria-label
await gotoStable(`${BASE}/ko/`);
const koLauncher = page.locator('button[aria-label="도움이 필요하세요?"]');
await koLauncher.waitFor({ state: 'visible', timeout: 10000 });
ok('KO launcher visible with localized aria', true);

// 7. /support landing
await gotoStable(`${BASE}/support/`);
ok('/support shows TOJI Helpdesk h1', (await page.locator('h1').first().textContent())?.includes('TOJI Helpdesk'));

// 8. /ko/support landing
await gotoStable(`${BASE}/ko/support/`);
ok('/ko/support shows landing', (await page.locator('h1').first().textContent())?.includes('TOJI Helpdesk'));

// 9. Standalone /support/tickets/new
await gotoStable(`${BASE}/support/tickets/new/`);
const stEmail = page.locator('main input[type="email"]').first();
await stEmail.waitFor({ state: 'visible', timeout: 5000 });
ok('Standalone ticket form renders email field', true);

// 10. /support/tickets/?id=demo without token → magic-link prompt
await gotoStable(`${BASE}/support/tickets/?id=demo123`);
const magicLink = page.getByRole('link', { name: 'Send link' });
await magicLink.waitFor({ state: 'visible', timeout: 5000 });
ok('Ticket page without token offers magic-link CTA', true);

// 11. /support/auth/magic-link
await gotoStable(`${BASE}/support/auth/magic-link/?id=abc`);
const ticketIdInput = page.locator('main input[type="text"]').first();
await ticketIdInput.waitFor({ state: 'visible', timeout: 5000 });
ok('Magic-link form renders', (await ticketIdInput.inputValue()) === 'abc');

await browser.close();

let failed = 0;
for (const c of checks) {
  console.log(`${c.ok ? '✓' : '✗'} ${c.name}${c.detail ? ` — ${c.detail}` : ''}`);
  if (!c.ok) failed++;
}
console.log(`\nconsole errors: ${consoleErrors.length}`);
for (const e of consoleErrors) console.log(`  ! ${e}`);

process.exit(failed === 0 ? 0 : 1);
