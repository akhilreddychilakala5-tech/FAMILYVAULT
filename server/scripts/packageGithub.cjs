const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve('..');
const targetZip = path.join(root, 'FamilyVault-GitHub.zip');
const staging = path.join(root, 'temp_github_export');

if (fs.existsSync(targetZip)) fs.unlinkSync(targetZip);
if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
fs.mkdirSync(staging, { recursive: true });

function copyFiltered(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (
      entry.name === 'node_modules' ||
      entry.name === 'dist' ||
      entry.name === 'cloudflared.exe' ||
      entry.name === 'temp_github_export' ||
      entry.name === '.git' ||
      entry.name === 'FamilyVault-GitHub.zip' ||
      entry.name === 'db' ||
      entry.name === '.env'
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyFiltered(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('📦 Gathering all clean source files for GitHub...');
copyFiltered(root, staging);

console.log('⚡ Compressing into FamilyVault-GitHub.zip...');
try {
  execSync(`powershell.exe -NoProfile -Command "Compress-Archive -Path '${staging}\\*' -DestinationPath '${targetZip}' -Force"`, {
    stdio: 'inherit',
  });

  fs.rmSync(staging, { recursive: true, force: true });

  const sizeKB = (fs.statSync(targetZip).size / 1024).toFixed(1);
  const sizeMB = (fs.statSync(targetZip).size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Successfully created clean GitHub repository package!`);
  console.log(`   Path: ${targetZip}`);
  console.log(`   Size: ${sizeMB} MB (${sizeKB} KB)`);
} catch (err) {
  console.error('Packaging failed:', err.message);
}
