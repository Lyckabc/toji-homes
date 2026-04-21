#!/usr/bin/env node
/**
 * Serves dist/ locally, opens ai-pragma (locale), hides site header/footer, prints to PDF.
 *
 * Run: npm run build && npm run pdf:ai-pragma
 *
 * Options (all optional):
 *   --locale=ko|en     Page locale (default: ko)
 *   --theme=light|dark Matches site html.dark (default: light)
 *   --scale=0.9        PDF content scale, 0.1–2 (default: 0.9)
 *   --out=PATH         Output file (default: data/ai-pragma-content.pdf)
 *
 * Examples:
 *   node scripts/export-ai-pragma-pdf.mjs --locale=en --theme=dark --scale=1
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');
const root = path.join(repoRoot, 'dist');
const dataDir = path.join(repoRoot, 'data');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/** @param {string[]} argv */
function parseOpts(argv) {
  /** @type {{ locale: 'ko' | 'en'; theme: 'light' | 'dark'; scale: number; out: string | null }} */
  const opts = {
    locale: 'ko',
    theme: 'light',
    scale: 0.9,
    out: null,
  };

  for (const raw of argv) {
    if (raw === '-h' || raw === '--help') {
      console.log(`Usage: node scripts/export-ai-pragma-pdf.mjs [options]

  --locale=ko|en     (default: ko)
  --theme=light|dark (default: light)
  --scale=NUMBER     0.1–2 (default: 0.9)
  --out=PATH         (default: data/ai-pragma-content.pdf)
`);
      process.exit(0);
    }
    if (raw.startsWith('--locale=')) {
      const v = raw.slice('--locale='.length).toLowerCase();
      if (v !== 'ko' && v !== 'en') {
        console.error(`Invalid --locale=${v} (use ko or en)`);
        process.exit(1);
      }
      opts.locale = v;
      continue;
    }
    if (raw.startsWith('--theme=')) {
      const v = raw.slice('--theme='.length).toLowerCase();
      if (v !== 'light' && v !== 'dark') {
        console.error(`Invalid --theme=${v} (use light or dark)`);
        process.exit(1);
      }
      opts.theme = v;
      continue;
    }
    if (raw.startsWith('--scale=')) {
      const n = Number(raw.slice('--scale='.length));
      if (!Number.isFinite(n) || n < 0.1 || n > 2) {
        console.error('Invalid --scale (use a number between 0.1 and 2)');
        process.exit(1);
      }
      opts.scale = n;
      continue;
    }
    if (raw.startsWith('--out=')) {
      opts.out = path.resolve(raw.slice('--out='.length));
      continue;
    }
  }

  return opts;
}

function resolvePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  let rel = decoded.replace(/^\/+/, '');
  if (rel.endsWith('/')) rel += 'index.html';
  else if (!path.extname(rel)) {
    const asDir = path.join(root, rel, 'index.html');
    if (fs.existsSync(asDir) && fs.statSync(asDir).isFile()) return asDir;
  }
  return path.join(root, rel);
}

function serve(req, res) {
  const filePath = resolvePath(req.url ?? '/');
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end();
    return;
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(serve);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      resolve({ server, port });
    });
    server.on('error', reject);
  });
}

const opts = parseOpts(process.argv.slice(2));
const defaultOut = path.join(dataDir, 'ai-pragma-content.pdf');
const outputPath = opts.out ?? defaultOut;

const pagePath =
  opts.locale === 'ko'
    ? path.join(root, 'ko', 'projects', 'ai-pragma', 'index.html')
    : path.join(root, 'projects', 'ai-pragma', 'index.html');
const urlPath = opts.locale === 'ko' ? '/ko/projects/ai-pragma/' : '/projects/ai-pragma/';

if (!fs.existsSync(pagePath)) {
  console.error(`Missing ${path.relative(repoRoot, pagePath)} — run: npm run build`);
  process.exit(1);
}

const { server, port } = await startServer();
const url = `http://127.0.0.1:${port}${urlPath}`;

let browser;
try {

  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle' });

  await page.evaluate((theme) => {
    const rootEl = document.documentElement;
    if (theme === 'dark') rootEl.classList.add('dark');
    else rootEl.classList.remove('dark');
  }, opts.theme);

  await page.addStyleTag({
    content: `
      header, footer { display: none !important; }
      main { min-height: 0 !important; }
      body > div.flex { min-height: 0 !important; }
    `,
  });
  await page.emulateMedia({ media: 'print' });

  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    scale: opts.scale,
    margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
  });

  console.log(`Wrote ${outputPath} (locale=${opts.locale}, theme=${opts.theme}, scale=${opts.scale})`);
} finally {
  await browser?.close();
  await new Promise((r) => server.close(r));
}
