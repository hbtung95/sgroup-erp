/**
 * post-export.js — Patches Expo web export for ESM compatibility
 * Fixes: "Cannot use 'import meta' outside a module"
 * Adds type="module" to script tags and PWA manifest link
 */
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.log('⚠️  dist/index.html not found, skipping post-export patch');
  process.exit(0);
}

let html = fs.readFileSync(indexPath, 'utf8');

// 1. Add type="module" to script tags that use import.meta
html = html.replace(
  /<script src="(.*?)" defer>/g,
  '<script src="$1" type="module">'
);

// 1b. Inject __METRO_GLOBAL_PREFIX__ before app bundle to fix RSC runtime error
// @expo/metro-runtime@55 unconditionally imports rsc/runtime.js which uses this var.
// Metro normally injects it, but the production web export doesn't define it.
if (!html.includes('__METRO_GLOBAL_PREFIX__')) {
  html = html.replace(
    '<body>',
    '<body>\n<script>var __METRO_GLOBAL_PREFIX__ = "";</script>'
  );
}

// 2. Add PWA manifest link if not present
if (!html.includes('manifest.json')) {
  html = html.replace(
    '</head>',
    '  <link rel="manifest" href="/manifest.json" />\n' +
    '  <meta name="theme-color" content="#3b82f6" />\n' +
    '  <meta name="description" content="SGROUP ERP - Hệ thống quản lý kinh doanh" />\n' +
    '</head>'
  );
}

// 3. Add apple-touch-icon if not present
if (!html.includes('apple-touch-icon')) {
  html = html.replace(
    '</head>',
    '  <link rel="apple-touch-icon" href="/assets/icon.png" />\n' +
    '</head>'
  );
}

fs.writeFileSync(indexPath, html, 'utf8');

// 4. Copy manifest.json to dist
const manifestSrc = path.join(__dirname, '..', 'web', 'manifest.json');
const manifestDest = path.join(__dirname, '..', 'dist', 'manifest.json');
if (fs.existsSync(manifestSrc) && !fs.existsSync(manifestDest)) {
  fs.copyFileSync(manifestSrc, manifestDest);
  console.log('   • Copied manifest.json to dist/');
}

// 5. Patch all JS files to remove import.meta which causes SyntaxError
const jsDir = path.join(__dirname, '..', 'dist', '_expo', 'static', 'js', 'web');
if (fs.existsSync(jsDir)) {
  const files = fs.readdirSync(jsDir);
  let patchedCount = 0;
  for (const file of files) {
    if (file.endsWith('.js')) {
      const filePath = path.join(jsDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('import.meta')) {
        // Zustand and other libraries use import.meta.env.MODE
        content = content.replace(/import\.meta\.env\.MODE/g, '"production"');
        content = content.replace(/import\.meta\.env/g, '({MODE:"production"})');
        content = content.replace(/import\.meta/g, '({env:{MODE:"production"}})');
        fs.writeFileSync(filePath, content, 'utf8');
        patchedCount++;
      }
    }
  }
  if (patchedCount > 0) {
    console.log(`   • Patched import.meta in ${patchedCount} JS files`);
  }
}

console.log('✅ Post-export patches applied:');
console.log('   • Added type="module" to script tags');
console.log('   • Injected __METRO_GLOBAL_PREFIX__ global (RSC fix)');
console.log('   • Added PWA manifest link');
console.log('   • Added apple-touch-icon');
console.log('   • Copied manifest.json');
