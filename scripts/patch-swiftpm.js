const fs = require('fs');
const path = require('path');

function patchPackageSwift(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1. Downgrade swift-tools-version to 6.0
  content = content.replace(/\/\/\s*swift-tools-version:\s*6\.[12](\.0)?/g, '// swift-tools-version: 6.0');

  // 2. Remove trailing commas before closing square brackets (Swift 6.0 compatibility)
  content = content.replace(/,(\s*\n\s*\])/g, '$1');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[patch-swiftpm] Successfully patched: ${filePath}`);
  } else {
    console.log(`[patch-swiftpm] Already up to date: ${filePath}`);
  }
}

function findAndPatch(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findAndPatch(fullPath);
    } else if (entry.name === 'Package.swift') {
      patchPackageSwift(fullPath);
    }
  }
}

const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
console.log('[patch-swiftpm] Scanning node_modules for Package.swift...');
findAndPatch(nodeModulesPath);
console.log('[patch-swiftpm] Complete.');
