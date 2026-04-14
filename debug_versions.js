const fs = require('fs');
const path = require('path');

function findPackageJsons(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      if (!file.includes('node_modules') && !file.includes('.git')) {
        results = results.concat(findPackageJsons(file));
      }
    } else if (file.endsWith('package.json')) {
      results.push(file);
    }
  });
  return results;
}

const files = findPackageJsons('.');
files.forEach(f => {
  try {
    const pkg = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (!pkg.version) {
      console.log(`[!] Invalid pkg version in ${f}: '${pkg.version}'`);
    }
    const deps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
    for (const [name, ver] of Object.entries(deps)) {
      if (ver === '' || ver === null || ver === undefined) {
         console.log(`[!] Empty dependency version in ${f}: ${name}`);
      }
    }
  } catch (e) {
    console.error(`Error reading ${f}: ${e.message}`);
  }
});
console.log("Done checking packages.");
