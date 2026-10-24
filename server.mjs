import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3000;
const REMOTE_ORIGIN = 'https://slowroads.io';
const ROOT_DIR = process.cwd();

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.icns': 'image/x-icns',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.obj': 'text/plain',
  '.mtl': 'text/plain'
};

// 1. Unpack downloaded_js into actual directories
function setupLocalFiles() {
  const downloadDir = path.join(ROOT_DIR, 'downloaded_js');
  if (!fs.existsSync(downloadDir)) return;

  const files = fs.readdirSync(downloadDir);
  for (const file of files) {
    if (file === 'alea.min.js') {
      fs.copyFileSync(path.join(downloadDir, file), path.join(ROOT_DIR, 'alea.min.js'));
      continue;
    }
    // Convert e.g. _app_immutable_entry_app.a7863966.js to _app/immutable/entry/app.a7863966.js
    const relPath = file.replace(/_/g, '/');
    // But wait, filenames themselves might not have had underscores except for _app.
    // Let's check original structure: _app/immutable/entry/..., _app/immutable/chunks/..., _app/immutable/nodes/...
    let actualPath;
    if (file.startsWith('_app_immutable_entry_')) {
      actualPath = path.join(ROOT_DIR, '_app', 'immutable', 'entry', file.replace('_app_immutable_entry_', ''));
    } else if (file.startsWith('_app_immutable_chunks_')) {
      actualPath = path.join(ROOT_DIR, '_app', 'immutable', 'chunks', file.replace('_app_immutable_chunks_', ''));
    } else if (file.startsWith('_app_immutable_nodes_')) {
      actualPath = path.join(ROOT_DIR, '_app', 'immutable', 'nodes', file.replace('_app_immutable_nodes_', ''));
    } else {
      actualPath = path.join(ROOT_DIR, file);
    }

    const dir = path.dirname(actualPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.copyFileSync(path.join(downloadDir, file), actualPath);
  }
  console.log('Unpacked JavaScript bundles into their respective directories.');
}

setupLocalFiles();

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse path
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(urlObj.pathname);
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  const localFilePath = path.join(ROOT_DIR, pathname.replace(/^\//, ''));

  // If local file exists, serve it
  if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).isFile()) {
    const ext = path.extname(localFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(localFilePath).pipe(res);
    return;
  }

  // If file doesn't exist locally, proxy fetch it from remote and cache it locally
  const remoteUrl = `${REMOTE_ORIGIN}${pathname}`;
  console.log(`[Cache Miss] Proxy-fetching: ${remoteUrl}`);

  try {
    const remoteRes = await fetch(remoteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!remoteRes.ok) {
      // If 404 and it's not a static asset, fallback to index.html (SPA routing)
      if (remoteRes.status === 404 && !path.extname(pathname)) {
        const indexFile = path.join(ROOT_DIR, 'index.html');
        if (fs.existsSync(indexFile)) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          fs.createReadStream(indexFile).pipe(res);
          return;
        }
      }
      res.writeHead(remoteRes.status);
      res.end(`Failed to fetch from upstream: ${remoteRes.status}`);
      return;
    }

    const arrayBuffer = await remoteRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to local disk cache
    const parentDir = path.dirname(localFilePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(localFilePath, buffer);
    console.log(`[Cached] Saved to: ${localFilePath}`);

    const ext = path.extname(localFilePath).toLowerCase();
    const contentType = remoteRes.headers.get('content-type') || MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(buffer);
  } catch (err) {
    console.error(`Error proxying ${remoteUrl}:`, err);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Slow Roads local test server running at: http://localhost:${PORT}/#A2-fa2a3548@3`);
});
