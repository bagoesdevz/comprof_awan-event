const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function loadSource(filename, stubs = {}) {
  const resolved = path.resolve(__dirname, '..', filename);
  const source = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  const importModule = name => {
    if (Object.hasOwn(stubs, name)) return stubs[name];
    if (name === 'server-only') return {};
    if (name.startsWith('@/')) return loadSource(name.slice(2) + '.ts', stubs);
    if (name.startsWith('.')) return loadSource(path.relative(path.resolve(__dirname,'..'),path.resolve(path.dirname(resolved),name))+'.ts',stubs);
    return require(name);
  };
  new Function('require', 'module', 'exports', source)(importModule, module, module.exports);
  return module.exports;
}
module.exports = loadSource;
