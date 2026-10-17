const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function loadSource(filename, stubs = {}) {
  const base = path.resolve(__dirname, '..', filename);
  const candidates = path.extname(base) ? [base] : [base + '.ts', base + '.tsx'];
  const resolved = candidates.find(candidate => fs.existsSync(candidate)) || base;
  const source = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  const importModule = name => {
    if (Object.hasOwn(stubs, name)) return stubs[name];
    if (name === 'server-only') return {};
    if (name.startsWith('@/')) return loadSource(name.slice(2), stubs);
    if (name.startsWith('.')) return loadSource(path.relative(path.resolve(__dirname,'..'),path.resolve(path.dirname(resolved),name)),stubs);
    return require(name);
  };
  new Function('require', 'module', 'exports', source)(importModule, module, module.exports);
  return module.exports;
}
module.exports = loadSource;
