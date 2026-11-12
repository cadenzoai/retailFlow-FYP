/**
 * react-native-screens 3.31.1 imports freezeEnabled from its own package entry.
 * That circular import is undefined at runtime and crashes every native stack
 * ("freezeEnabled is not a function"). Import it from the core module instead.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'node_modules', 'react-native-screens');

const edits = [
  {
    file: path.join(root, 'src', 'components', 'ScreenStack.tsx'),
    from: "import { ScreenStackProps, freezeEnabled } from 'react-native-screens';",
    to: "import { freezeEnabled } from '../core';\nimport { ScreenStackProps } from '../types';"
  },
  {
    file: path.join(root, 'lib', 'module', 'components', 'ScreenStack.js'),
    from: "import { freezeEnabled } from 'react-native-screens';",
    to: "import { freezeEnabled } from '../core';"
  },
  {
    file: path.join(root, 'lib', 'commonjs', 'components', 'ScreenStack.js'),
    from: 'var _reactNativeScreens = require("react-native-screens");',
    to: 'var _core = require("../core");'
  },
  {
    file: path.join(root, 'lib', 'commonjs', 'components', 'ScreenStack.js'),
    from: '(0, _reactNativeScreens.freezeEnabled)()',
    to: '(0, _core.freezeEnabled)()'
  }
];

for (const edit of edits) {
  if (!fs.existsSync(edit.file)) continue;
  const source = fs.readFileSync(edit.file, 'utf8');
  if (!source.includes(edit.from)) continue;
  fs.writeFileSync(edit.file, source.replace(edit.from, edit.to));
}
