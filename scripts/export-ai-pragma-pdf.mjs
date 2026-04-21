#!/usr/bin/env node
/**
 * Serves dist/ locally, opens /projects/ai-pragma/, hides site header/footer, prints to PDF.
 * Run: npm run build && npm run pdf:ai-pragma
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'dist');

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

const defaultOut = path.join(root, 'projects', 'ai-pragma', 'ai-pragma-content.pdf');
const outArg = process.argv.find((a) => a.startsWith('--out='));
const outputPath = outArg ? path.resolve(outArg.slice('--out='.length)) : defaultOut;

const { server, port } = await startServer();
const url = `http://127.0.0.1:${port}/projects/ai-pragma/`;

let browser;
try {
  if (!fs.existsSync(path.join(root, 'projects', 'ai-pragma', 'index.html'))) {
    console.error('Missing dist/projects/ai-pragma/index.html — run: npm run build');
    process.exit(1);
  }

  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
  });
  await page.addStyleTag({
    content: `
      @media print {
        header, footer { display: none !important; }
        main { min-height: 0 !important; }
      }
      header, footer { display: none !important; }
      main { min-height: 0 !important; }
    `,
  });

  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
  });

  console.log(`Wrote ${outputPath}`);
} finally {
  await browser?.close();
  await new Promise((r) => server.close(r));
}
