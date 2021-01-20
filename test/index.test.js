const fs = require('fs');
const path = require('path');
const rollup = require('./../node_modules/rollup/dist/rollup').rollup;

const inlinePostCSS = require('./../dist/index').default;

function fixture(...args) {
  return path.join(__dirname, 'fixtures', ...args);
}

async function write({ input, outDir, options }) {
  const jsCodePath = path.join(outDir, 'bundle.js');

  const bundle = await rollup({
    input: fixture(input),
    plugins: [
      inlinePostCSS({
        styleRegex: /css\`((.|\n)*)\`(;)/gm,
        plugins: [require('postcss-rgb-plz')],
      }),
    ],
  });

  await bundle.write({
    format: 'esm',
    file: path.join(outDir, 'bundle.js'),
  });

  return {
    jsCode() {
      return fs.readFile(jsCodePath, 'utf8');
    },
    hasRGBColorValues() {
      const file = fs.readFileSync(path.join(outDir, 'bundle.js'), 'utf8');
      const style = file.match(/\`((.|\n)*)\`/gm)[0];
      return /(#abcefe)/gm.exec(style) == null ? true : false;
    },
    isMinified() {
      const file = fs.readFileSync(path.join(outDir, 'bundle.js'), 'utf8');
      const style = file.match(/\`((.|\n)*)\`/gm)[0];
      return /\r|\n/.exec(style) == null ? true : false;
    },
  };
}

test('inline css has rgb values', async () => {
  const res = await write({
    input: 'component.js',
    outDir: 'test/onExtract',
    options: {},
  });
  expect(await res.hasRGBColorValues()).toBe(true);
});
