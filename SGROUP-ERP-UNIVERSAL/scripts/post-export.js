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

console.log('✅ Post-export patches applied:');
console.log('   • Added type="module" to script tags');
console.log('   • Added PWA manifest link');
console.log('   • Added apple-touch-icon');
console.log('   • Copied manifest.json');
