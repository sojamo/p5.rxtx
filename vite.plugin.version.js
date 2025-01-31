// vite-version-plugin.js
import fs from 'fs';
import path from 'path';

export default function vitePluginVersion() {
  return {
    name: 'vite-version-inject',
    transform(code, id) {
      // Only transform keyboard.js
      if (!id.endsWith('src/ui/keyboard.js')) {
        return null;
      }

      // Read package.json
      const packageJson = JSON.parse(
        fs.readFileSync(path.resolve('./package.json'), 'utf-8')
      );
      const version = packageJson.version;

      // Replace the version placeholder in the code
      // You can adjust the placeholder pattern as needed
      const modifiedCode = code.replace(
        /\/\* @INJECT_VERSION \*\//g,
        `'${version}'`
      );

      return {
        code: modifiedCode,
        map: null
      };
    }
  };
}