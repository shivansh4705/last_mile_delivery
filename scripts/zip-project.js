const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const zipOutputPath = path.join(rootDir, 'last-mile-delivery-tracker.zip');

console.log('📦 Packaging Last-Mile Delivery Tracker project into zip archive...');

try {
  // Use PowerShell Compress-Archive on Windows
  const cmd = `powershell -Command "Compress-Archive -Path '${rootDir}\\server', '${rootDir}\\client', '${rootDir}\\README.md', '${rootDir}\\system_design.md', '${rootDir}\\package.json', '${rootDir}\\.env.example' -DestinationPath '${zipOutputPath}' -Force"`;
  execSync(cmd, { stdio: 'inherit' });
  console.log(`\n✅ Zip archive created successfully at:\n   ${zipOutputPath}`);
} catch (err) {
  console.error('❌ Error creating zip file:', err.message);
}
