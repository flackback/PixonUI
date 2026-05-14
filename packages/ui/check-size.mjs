import fs from 'fs';
import zlib from 'zlib';

const file = 'dist/index.mjs';
const content = fs.readFileSync(file);
const gzipped = zlib.gzipSync(content);
console.log(`File: ${file}`);
console.log(`Size: ${content.length} bytes`);
console.log(`Gzip: ${gzipped.length} bytes`);
