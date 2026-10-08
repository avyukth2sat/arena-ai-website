const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const TEMPLATES = path.join(ROOT, 'templates');
const PORT = Number(process.env.PORT || 3000);
const REFERENCE_ORIGIN = 'https://3000-iqknnls9pood11ad4bq3j.e2b.app';
const USE_REFERENCE_PROXY = process.env.USE_REFERENCE_PROXY === '1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

const CUISINES = new Set(['indian', 'korean', 'mexican', 'nigerian', 'vietnamese']);
const FEATURED_INGREDIENTS = new Map([
  ['scotch bonnet peppers', 'sub-scotch-bonnet-peppers'],
  ['scotch bonnet', 'sub-scotch-bonnet-peppers'],
  ['makrut lime leaves', 'sub-makrut-lime-leaves'],
  ['makrut lime', 'sub-makrut-lime-leaves'],
  ['paneer', 'sub-paneer'],
  ['gochugaru', 'sub-gochugaru'],
  ['sour orange juice', 'sub-sour-orange-juice'],
  ['sour orange', 'sub-sour-orange-juice'],
  ['kecap manis', 'sub-kecap-manis'],
  ['masarepa', 'sub-masarepa'],
  ['jameed', 'sub-jameed'],
]);

function normalize(value) {
  return (value || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[()]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function templateFor(url) {
  const pathname = decodeURIComponent(url.pathname).replace(/\/+$/, '') || '/';
  if (pathname === '/') return 'home';

  if (pathname === '/kitchen') {
    const mode = normalize(url.searchParams.get('mode'));
    if (mode === 'ingredient') return 'kitchen-ingredient';
    if (mode === 'missing') return 'kitchen-missing';
    if (mode === 'paste') return 'kitchen-paste';
    return 'kitchen';
  }

  if (pathname === '/substitutes') {
    const query = normalize(url.searchParams.get('q'));
    if (query) {
      const exact = FEATURED_INGREDIENTS.get(query);
      if (exact) return exact;
      for (const [needle, template] of FEATURED_INGREDIENTS) {
        if (query.includes(needle)) return template;
      }
    }
    return 'substitutes';
  }

  if (pathname === '/recipes') {
    const cuisine = normalize(url.searchParams.get('cuisine'));
    return CUISINES.has(cuisine) ? `recipes-${cuisine}` : 'recipes';
  }

  const recipeMatch = pathname.match(/^\/recipes\/(\d+)$/);
  if (recipeMatch) {
    const id = Number(recipeMatch[1]);
    if (id >= 1 && id <= 6) return `recipe-${id}`;
  }
  return null;
}

function sendFile(res, filePath, method = 'GET') {
  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    if (method === 'HEAD') res.end();
    else fs.createReadStream(filePath).pipe(res);
  });
}

function notFound(res) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found · Culturize</title><link rel="stylesheet" href="/assets/site.css"><link rel="stylesheet" href="/assets/interactions.css"></head><body class="min-h-screen bg-cream font-sans text-ink antialiased"><main class="mx-auto max-w-3xl px-5 py-24 text-center"><p class="text-xs font-semibold uppercase tracking-[.16em] text-muted">Culturize</p><h1 class="mt-3 font-display text-4xl font-semibold">We couldn't find that page.</h1><p class="mt-4 text-muted">Head back to the kitchen and tell us what you want to cook.</p><a class="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-paprika px-5 py-2.5 text-sm font-semibold text-white" href="/kitchen">Open the kitchen →</a></main><script defer src="/js/app.js"></script></body></html>`;
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

function serveLocal(req, res, url) {
  const pathname = url.pathname;
  if (pathname.startsWith('/assets/') || pathname.startsWith('/js/')) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Method not allowed');
      return;
    }
    const base = pathname.startsWith('/assets/') ? path.join(PUBLIC, 'assets') : path.join(PUBLIC, 'js');
    const relative = decodeURIComponent(pathname.replace(/^\/(?:assets|js)\//, ''));
    const filePath = path.resolve(base, relative);
    if (!filePath.startsWith(path.resolve(base) + path.sep)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }
    sendFile(res, filePath, req.method);
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method not allowed');
    return;
  }

  const template = templateFor(url);
  if (!template) {
    notFound(res);
    return;
  }
  const filePath = path.join(TEMPLATES, `${template}.html`);
  fs.readFile(filePath, (error, data) => {
    if (error) {
      notFound(res);
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': data.length,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}

function proxyToReference(req, res, url) {
  const targetUrl = new URL(req.url, REFERENCE_ORIGIN);
  const headers = { ...req.headers };
  headers.host = targetUrl.host;
  headers['x-forwarded-host'] = targetUrl.host;
  headers['x-forwarded-proto'] = 'https';
  headers['x-forwarded-port'] = '443';

  if (headers.origin) headers.origin = REFERENCE_ORIGIN;
  if (headers.referer) {
    try {
      const referer = new URL(headers.referer);
      headers.referer = `${REFERENCE_ORIGIN}${referer.pathname}${referer.search}${referer.hash}`;
    } catch { /* keep the original referer if malformed */ }
  }

  const outbound = https.request(targetUrl, {
    method: req.method,
    headers,
    timeout: 90000,
  }, (upstream) => {
    const responseHeaders = { ...upstream.headers };
    // Strip hop-by-hop and anti-embedding headers while keeping the original app payload intact.
    for (const name of [
      'connection', 'keep-alive', 'transfer-encoding', 'upgrade', 'proxy-authenticate',
      'proxy-authorization', 'te', 'trailer', 'alt-svc', 'x-frame-options', 'content-security-policy',
    ]) delete responseHeaders[name];
    if (responseHeaders['set-cookie']) {
      const cookies = Array.isArray(responseHeaders['set-cookie']) ? responseHeaders['set-cookie'] : [responseHeaders['set-cookie']];
      responseHeaders['set-cookie'] = cookies.map((cookie) => cookie.replace(/;\s*domain=[^;]+/ig, ''));
    }
    if (responseHeaders.location) {
      responseHeaders.location = responseHeaders.location
        .replace(/^https?:\/\/3000-iqknnls9pood11ad4bq3j\.e2b\.app/i, '');
    }
    responseHeaders['cache-control'] = 'no-store';
    res.writeHead(upstream.statusCode || 502, responseHeaders);
    upstream.on('error', () => res.destroy());
    upstream.pipe(res);
  });

  outbound.on('timeout', () => outbound.destroy(new Error('Upstream timeout')));
  outbound.on('error', (error) => {
    console.error(`Reference proxy failed for ${url.pathname}: ${error.message}`);
    if (!res.headersSent && (req.method === 'GET' || req.method === 'HEAD')) {
      serveLocal(req, res, url);
    } else if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('The Culturize reference server is temporarily unavailable.');
    } else {
      res.destroy();
    }
  });

  req.on('aborted', () => outbound.destroy());
  req.pipe(outbound);
}

const server = http.createServer((req, res) => {
  let url;
  try {
    url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  // These self-hosted files are the offline snapshot and fallback assets. The original
  // application serves its own files under /_next/*, which are proxied below in live mode.
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/js/')) {
    serveLocal(req, res, url);
    return;
  }

  if (USE_REFERENCE_PROXY) {
    proxyToReference(req, res, url);
    return;
  }
  serveLocal(req, res, url);
});

server.requestTimeout = 120000;
server.headersTimeout = 125000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Culturize ${USE_REFERENCE_PROXY ? 'reference mirror' : 'offline clone'} listening on http://0.0.0.0:${PORT}`);
});

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
