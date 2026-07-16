const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = fs.readFileSync(path.resolve(__dirname, '../static/js/scripts.js'), 'utf8');

function loadScriptWithRandom(randomValue) {
  const context = {
    console,
    Math: Object.create(Math),
    window: {
      addEventListener() {},
      matchMedia() {
        return { matches: false };
      },
      setInterval() {},
    },
    document: {},
    HTMLAnchorElement: function HTMLAnchorElement() {},
  };

  context.Math.random = () => randomValue;
  vm.createContext(context);
  vm.runInContext(script, context);
  return context;
}

let context = loadScriptWithRandom(0);
assert.equal(context.chooseInitialBackgroundIndex(2), 0, 'random value 0 should select first background');

context = loadScriptWithRandom(0.75);
assert.equal(context.chooseInitialBackgroundIndex(2), 1, 'random value 0.75 should select second background');

context = loadScriptWithRandom(0.99);
assert.equal(context.chooseInitialBackgroundIndex(1), 0, 'single background should always select first background');
assert.equal(context.chooseInitialBackgroundIndex(0), 0, 'empty background list should fall back to index 0');

console.log('background selection checks passed');
