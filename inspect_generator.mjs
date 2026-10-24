import fs from 'fs';
import path from 'path';

function inspectExports() {
  const file = './downloaded_js/_app_immutable_chunks_DevMidlineGenerator.7013ef99.js';
  const content = fs.readFileSync(file, 'utf8');
  const exportIdx = content.lastIndexOf('export');
  console.log('--- DevMidlineGenerator Exports ---');
  console.log(content.slice(exportIdx, exportIdx + 600));

  // Find classes
  const classes = [];
  const classRegex = /class\s+([A-Za-z0-9_$]+)(\s+extends\s+([A-Za-z0-9_$]+))?/g;
  let m;
  while ((m = classRegex.exec(content)) !== null) {
    classes.push({ name: m[1], extends: m[3] || null, index: m.index });
  }
  console.log('Found classes in DevMidlineGenerator:', classes.length);
  for (const c of classes.slice(0, 20)) {
    console.log(`Class: ${c.name} ${c.extends ? 'extends ' + c.extends : ''} at ${c.index}`);
  }
}

inspectExports();
