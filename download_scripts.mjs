import fs from 'fs';
import path from 'path';

const outDir = './downloaded_js';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Read service-worker.js
const sw = fs.readFileSync('./service-worker.js', 'utf8');

// Find all .js files in service-worker.js
const regex = /["']([^"']+\.js)["']/g;
const jsFiles = new Set();
let match;
while ((match = regex.exec(sw)) !== null) {
  let file = match[1];
  if (file.startsWith('e+"')) {
    file = file.slice(3);
  }
  file = file.replace(/^e\+/, '').replace(/^\.\//, '').replace(/^\//, '');
  if (file.endsWith('.js')) {
    jsFiles.add(file);
  }
}

// Also add known entry points
jsFiles.add('_app/immutable/entry/start.4593a708.js');
jsFiles.add('_app/immutable/entry/app.a7863966.js');
jsFiles.add('alea.min.js');

console.log(`Found ${jsFiles.size} JS files to download.`);

async function downloadAll() {
  for (const relPath of jsFiles) {
    const cleanPath = relPath.startsWith('/') ? relPath.slice(1) : relPath;
    const url = `https://slowroads.io/${cleanPath}`;
    const targetFile = path.join(outDir, cleanPath.replace(/\//g, '_'));
    
    try {
      console.log(`Downloading: ${url} -> ${targetFile}`);
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Failed ${url}: ${res.status}`);
        continue;
      }
      const text = await res.text();
      fs.writeFileSync(targetFile, text, 'utf8');
    } catch (err) {
      console.error(`Error downloading ${url}:`, err);
    }
  }
  console.log('Finished downloading files.');
}

downloadAll();
