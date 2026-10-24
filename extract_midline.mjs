import fs from 'fs';

const devMidline = fs.readFileSync('./downloaded_js/_app_immutable_chunks_DevMidlineGenerator.7013ef99.js', 'utf8');

// Find the midline generator class around 543000 - 550000
const start = 542000;
const end = 552000;
console.log('--- Midline Generator Class Excerpt ---');
console.log(devMidline.slice(start, start + 4000));
