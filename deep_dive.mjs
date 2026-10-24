import fs from 'fs';

const devMidline = fs.readFileSync('./downloaded_js/_app_immutable_chunks_DevMidlineGenerator.7013ef99.js', 'utf8');
const settingsManager = fs.readFileSync('./downloaded_js/_app_immutable_chunks_SettingsManager.a31845d6.js', 'utf8');
const nodes3 = fs.readFileSync('./downloaded_js/_app_immutable_nodes_3.da2ad8c8.js', 'utf8');

console.log('File sizes:', {
  devMidline: devMidline.length,
  settingsManager: settingsManager.length,
  nodes3: nodes3.length
});

// Let's search for road generation logic
// Midline generation, nodes, spline, curve, step, update
function findMatches(source, name, term, max=5) {
  let idx = 0;
  let count = 0;
  console.log(`\n=== Matches for ${term} in ${name} ===`);
  while ((idx = source.indexOf(term, idx)) !== -1 && count < max) {
    console.log(`--- Match ${count+1} at index ${idx} ---`);
    console.log(source.slice(Math.max(0, idx - 80), Math.min(source.length, idx + 250)));
    idx += term.length;
    count++;
  }
}

// 1. Road style parameters
findMatches(devMidline, 'devMidline', 'roadStyle', 6);

// 2. Road generation loop / step / spline
findMatches(devMidline, 'devMidline', 'generateNode', 5);
findMatches(devMidline, 'devMidline', 'addNode', 5);
findMatches(devMidline, 'devMidline', 'curvature', 5);

// 3. Vehicle physics
findMatches(settingsManager, 'settingsManager', 'suspension', 5);
findMatches(settingsManager, 'settingsManager', 'steer', 5);
findMatches(settingsManager, 'settingsManager', 'throttle', 5);
findMatches(settingsManager, 'settingsManager', 'gear', 5);
