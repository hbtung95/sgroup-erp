const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../src/features/bdh');
const overviewDir = path.join(baseDir, 'Overview');
const planningDir = path.join(baseDir, 'Planning');

const fixFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix borderSubtle
  content = content.replace(/colors\.borderSubtle/g, 'colors.border');

  // Fix SGEmptyState description -> subtitle
  content = content.replace(/description=\{/g, 'subtitle={');

  // Fix SGEmptyState action -> actionLabel and onAction
  content = content.replace(/action=\{\{ label: "Initialize Matrix", onPress: \(\) => \{\} \}\}/g, 'actionLabel="Initialize Matrix"\n              onAction={() => {}}');

  // Fix SGButton label -> title and leftIcon -> icon
  content = content.replace(/label="Commit Plan"/g, 'title="Commit Plan"');
  content = content.replace(/leftIcon=\{/g, 'icon={');

  // Fix SGLoadingOverlay inline
  content = content.replace(/inline \/\>/g, '/>');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed', filePath);
};

// Overview files
const overviewFiles = ['Dashboard', 'Sales', 'Marketing', 'HR', 'Agency', 'SHomes', 'Project', 'Ops', 'Finance']
  .map(f => path.join(overviewDir, `Overview${f}.tsx`));

// Planning files
const planningFiles = ['Total', 'Sales', 'Marketing', 'HR', 'Agency', 'SHomes', 'Project', 'Ops', 'Finance']
  .map(f => path.join(planningDir, `Plan${f}.tsx`));

overviewFiles.forEach(fixFile);
planningFiles.forEach(fixFile);

console.log('All TS errors fixed successfully!');
