const fs = require('fs');
const path = require('path');

// 1. Patch expo-asset to avoid fatal crash if ExpoAsset native module is not present
const assetPaths = [
  path.join(__dirname, '..', 'node_modules', 'expo-asset', 'build', 'ExpoAsset.js'),
  path.join(__dirname, '..', 'node_modules', 'expo-asset', 'src', 'ExpoAsset.ts'),
];

for (const targetPath of assetPaths) {
  if (fs.existsSync(targetPath)) {
    let content = fs.readFileSync(targetPath, 'utf8');
    if (content.includes("requireNativeModule('ExpoAsset')")) {
      content = content.replace("requireNativeModule('ExpoAsset')", "requireOptionalNativeModule('ExpoAsset')");
      content = content.replace("import { requireNativeModule } from 'expo-modules-core';", "import { requireOptionalNativeModule } from 'expo-modules-core';");
      content = content.replace(
        "return AssetModule.downloadAsync(url, md5Hash, type);",
        "if (AssetModule && AssetModule.downloadAsync) {\n    return AssetModule.downloadAsync(url, md5Hash, type);\n  }\n  return url;"
      );
      fs.writeFileSync(targetPath, content, 'utf8');
      console.log(`[patch-modules] Successfully patched ${targetPath}`);
    }
  }
}

// 2. Patch ExpoFetchModule to avoid fatal crash if ExpoFetchModule native module is not present
const fetchModulePaths = [
  path.join(__dirname, '..', 'node_modules', 'expo', 'src', 'winter', 'fetch', 'ExpoFetchModule.ts'),
];

for (const targetPath of fetchModulePaths) {
  if (fs.existsSync(targetPath)) {
    let content = fs.readFileSync(targetPath, 'utf8');
    if (content.includes("requireNativeModule('ExpoFetchModule')")) {
      content = `import { requireOptionalNativeModule } from 'expo-modules-core';

class StubNativeRequest {}
class StubNativeResponse {}

export const ExpoFetchModule =
  requireOptionalNativeModule('ExpoFetchModule') ?? {
    NativeRequest: StubNativeRequest,
    NativeResponse: StubNativeResponse,
  };
`;
      fs.writeFileSync(targetPath, content, 'utf8');
      console.log(`[patch-modules] Successfully patched ${targetPath}`);
    }
  }
}
