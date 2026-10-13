const fs = require('fs');
const path = require('path');

function patchFile(filePath, transforms) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  for (const [pattern, replacement] of transforms) {
    content = content.replace(pattern, replacement);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[patch-swiftpm] Successfully patched: ${filePath}`);
  }
}

function walkAndPatch(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkAndPatch(fullPath);
    } else {
      if (entry.name === 'Package.swift') {
        patchFile(fullPath, [
          [/\/\/\s*swift-tools-version:\s*6\.[12](\.0)?/g, '// swift-tools-version: 6.0'],
          [/,(\s*\n\s*\])/g, '$1']
        ]);
      } else if (entry.name.endsWith('.swift')) {
        patchFile(fullPath, [
          // Swift 6.0/6.1 requires weak variables to be mutable (var instead of let)
          [/(\b(?:private|internal|public|fileprivate)?\s*)weak\s+let\s+runtime:/g, '$1weak var runtime:'],
          // Remove trailing comma in closure parameter list
          [/(_ arguments:\s*consuming\s*JavaScriptValuesBuffer),(\s*\n\s*\))/g, '$1$2']
        ]);
      } else if (entry.name === 'RuntimeScheduler.h') {
        patchFile(fullPath, [
          [/SWIFT_RETURNS_RETAINED\s+RuntimeScheduler\(/g, 'RuntimeScheduler(']
        ]);
      }
    }
  }
}

const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
console.log('[patch-swiftpm] Scanning node_modules to patch Swift 6.0/6.1 compatibility...');
walkAndPatch(nodeModulesPath);
console.log('[patch-swiftpm] Complete.');
