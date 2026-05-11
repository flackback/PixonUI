#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color Helpers (Zero-dependency ANSI escapes)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m'
};

const print = {
  info: (msg: string) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✔${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.error(`${colors.red}✖${colors.reset} ${msg}`),
  title: (msg: string) => console.log(`\n${colors.bright}${colors.blue}=== ${msg} ===${colors.reset}\n`)
};

// Simple Readline Helper for input prompts on Windows
function ask(question: string, defaultValue = ''): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(`${colors.bright}${question}${colors.reset}${defaultValue ? ` [${defaultValue}]` : ''}: `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

// Find PixonUI source directories relative to CLI install path
const UI_COMPONENTS_SRC = path.resolve(__dirname, '../../ui/src/components');
const UI_HOOKS_SRC = path.resolve(__dirname, '../../ui/src/hooks');
const UI_UTILS_SRC = path.resolve(__dirname, '../../ui/src/utils');

// Helper to recursively copy directories/files
async function copyRecursive(src: string, dest: string) {
  const stats = await fs.stat(src);
  if (stats.isDirectory()) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src);
    for (const entry of entries) {
      await copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    const parentDir = path.dirname(dest);
    await fs.mkdir(parentDir, { recursive: true });
    await fs.copyFile(src, dest);
  }
}

const program = new Command();

program
  .name('pixonui')
  .description('PixonUI Shadcn-style Copier CLI')
  .version('0.1.0');

// init command
program
  .command('init')
  .description('Initialize PixonUI configuration in your project')
  .action(async () => {
    print.title('PixonUI Initialization');

    const configPath = path.join(process.cwd(), 'pixonui.json');
    if (existsSync(configPath)) {
      print.warn('pixonui.json already exists.');
      const overwrite = await ask('Do you want to overwrite it?', 'no');
      if (overwrite.toLowerCase() !== 'yes' && overwrite.toLowerCase() !== 'y') {
        print.info('Initialization aborted.');
        return;
      }
    }

    const componentsDir = await ask('Where should PixonUI components be copied?', './src/components/pixonui');
    const cssDir = await ask('Where is your global CSS file located?', './src/index.css');

    const config = {
      $schema: 'https://pixonui.lovable.app/schema.json',
      componentsDir,
      cssDir,
      utilsDir: './src/utils/pixonui',
      hooksDir: './src/hooks/pixonui'
    };

    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    print.success('pixonui.json successfully created!');
    
    // Create base directories
    await fs.mkdir(path.resolve(process.cwd(), componentsDir), { recursive: true });
    await fs.mkdir(path.resolve(process.cwd(), config.utilsDir), { recursive: true });
    await fs.mkdir(path.resolve(process.cwd(), config.hooksDir), { recursive: true });

    print.info(`Next Steps:
1. Ensure your Tailwind CSS configuration supports custom color definitions (variables like --color-primary).
2. Start adding premium components using: ${colors.green}npx pixonui add <component-name>${colors.reset}`);
  });

// add command
program
  .command('add [component]')
  .description('Add a component directly into your project')
  .action(async (componentName) => {
    print.title('Add PixonUI Component');

    const configPath = path.join(process.cwd(), 'pixonui.json');
    if (!existsSync(configPath)) {
      print.error('Configuration file (pixonui.json) not found. Please run "npx pixonui init" first.');
      return;
    }

    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    const componentsDir = path.resolve(process.cwd(), config.componentsDir);
    const utilsDir = path.resolve(process.cwd(), config.utilsDir || './src/utils/pixonui');
    const hooksDir = path.resolve(process.cwd(), config.hooksDir || './src/hooks/pixonui');

    // If no component is specified, let's list available components
    if (!componentName) {
      print.info('No component name specified. Available core templates:');
      console.log(`  - ${colors.green}button${colors.reset} (Primary, Glow buttons)`);
      console.log(`  - ${colors.green}card${colors.reset} (Metric, Glow, Standard cards)`);
      console.log(`  - ${colors.green}chat${colors.reset} (Next-Gen AI & SaaS Inbox layouts)`);
      console.log(`  - ${colors.green}kanban${colors.reset} (Performance-tuned Kanban task boards)`);
      console.log(`  - ${colors.green}datatable${colors.reset} (Audited accessibility data grid)`);
      console.log(`  - ${colors.green}slider${colors.reset} (Standard & Advanced interactive sliders)`);
      console.log(`\nRun: ${colors.cyan}npx pixonui add <component-name>${colors.reset} to copy.`);
      return;
    }

    // Map component to source directory/files
    let srcPath = '';
    let destPath = '';
    const compNameLower = componentName.toLowerCase();

    // Ensure utility "cn" is copied as a helper
    const cnSrc = path.join(UI_UTILS_SRC, 'cn.ts');
    const cnDest = path.join(utilsDir, 'cn.ts');
    if (existsSync(cnSrc) && !existsSync(cnDest)) {
      await fs.mkdir(utilsDir, { recursive: true });
      await fs.copyFile(cnSrc, cnDest);
      print.success('Added utility helper: cn.ts');
    }

    if (compNameLower === 'button') {
      srcPath = path.join(UI_COMPONENTS_SRC, 'button');
      destPath = path.join(componentsDir, 'button');
    } else if (compNameLower === 'card') {
      srcPath = path.join(UI_COMPONENTS_SRC, 'card');
      destPath = path.join(componentsDir, 'card');
    } else if (compNameLower === 'chat') {
      srcPath = path.join(UI_COMPONENTS_SRC, 'chat');
      destPath = path.join(componentsDir, 'chat');
      // Also copy chat hook
      const chatHookSrc = path.join(UI_HOOKS_SRC, 'useChat.ts');
      const chatHookDest = path.join(hooksDir, 'useChat.ts');
      if (existsSync(chatHookSrc)) {
        await fs.mkdir(hooksDir, { recursive: true });
        await fs.copyFile(chatHookSrc, chatHookDest);
        print.success('Added dependent hook: useChat.ts');
      }
    } else if (compNameLower === 'kanban') {
      srcPath = path.join(UI_COMPONENTS_SRC, 'data-display', 'kanban');
      destPath = path.join(componentsDir, 'kanban');
      // Copy kanban hook
      const kanbanHookSrc = path.join(UI_HOOKS_SRC, 'useKanban.ts');
      const kanbanHookDest = path.join(hooksDir, 'useKanban.ts');
      if (existsSync(kanbanHookSrc)) {
        await fs.mkdir(hooksDir, { recursive: true });
        await fs.copyFile(kanbanHookSrc, kanbanHookDest);
        print.success('Added dependent hook: useKanban.ts');
      }
    } else if (compNameLower === 'datatable') {
      srcPath = path.join(UI_COMPONENTS_SRC, 'data-display', 'DataTable.tsx');
      destPath = path.join(componentsDir, 'DataTable.tsx');
    } else if (compNameLower === 'slider') {
      srcPath = path.join(UI_COMPONENTS_SRC, 'form', 'Slider.tsx');
      destPath = path.join(componentsDir, 'Slider.tsx');
    } else {
      print.error(`Unknown component: "${componentName}". Run "npx pixonui add" to list available components.`);
      return;
    }

    if (existsSync(srcPath)) {
      await copyRecursive(srcPath, destPath);
      print.success(`Successfully copied component "${componentName}" into your project!`);
      print.info(`Target directory: ${destPath}`);
    } else {
      // In case we are running outside the monorepo, simulate success or pull template
      print.warn(`Could not locate local source for "${componentName}" at this path. Creating mock/placeholder file...`);
      await fs.mkdir(destPath, { recursive: true });
      await fs.writeFile(path.join(destPath, `${componentName}.tsx`), `// Template file for ${componentName}\nexport const ${componentName} = () => <div>${componentName} Component</div>;`);
      print.success(`Created template placeholder for "${componentName}".`);
    }
  });

program.parse();
