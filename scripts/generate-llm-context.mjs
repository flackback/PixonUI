import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const UI_SRC = path.join(ROOT_DIR, 'packages/ui/src');
const OUTPUT_FILE = path.join(ROOT_DIR, 'llms-full.txt');

async function getFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((res) => {
    const resPath = path.resolve(dir, res.name);
    return res.isDirectory() ? getFiles(resPath) : resPath;
  }));
  return Array.prototype.concat(...files);
}

async function generate() {
  console.log('Generating llms-full.txt...');
  let fullContext = '';

  // 1. Add the main context document
  try {
    const mainContext = await fs.readFile(path.join(ROOT_DIR, 'docs/PIXONUI_CONTEXT.md'), 'utf-8');
    fullContext += '=== PIXONUI CORE CONTEXT ===\n\n' + mainContext + '\n\n';
  } catch (e) {
    console.warn('PIXONUI_CONTEXT.md not found, skipping header.');
  }

  // 2. Add all component source codes
  const componentsDir = path.join(UI_SRC, 'components');
  const allFiles = await getFiles(componentsDir);
  
  const relevantFiles = allFiles.filter(f => 
    (f.endsWith('.tsx') || f.endsWith('.ts')) && 
    !f.includes('.test.') && 
    !f.includes('index.ts')
  );

  for (const file of relevantFiles) {
    const relativePath = path.relative(ROOT_DIR, file);
    const content = await fs.readFile(file, 'utf-8');
    fullContext += `\n\n=== FILE: ${relativePath} ===\n\n${content}\n`;
  }

  // 3. Add hooks
  const hooksDir = path.join(UI_SRC, 'hooks');
  const hookFiles = await getFiles(hooksDir);
  for (const file of hookFiles.filter(f => f.endsWith('.ts'))) {
    const relativePath = path.relative(ROOT_DIR, file);
    const content = await fs.readFile(file, 'utf-8');
    fullContext += `\n\n=== FILE: ${relativePath} ===\n\n${content}\n`;
  }

  await fs.writeFile(OUTPUT_FILE, fullContext);
  console.log(`Successfully generated ${OUTPUT_FILE}`);
}

generate().catch(console.error);
