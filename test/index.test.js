const fs = require('fs');
const path = require('path');
const rollup = require('./../node_modules/rollup/dist/rollup').rollup;

const inlinePostCSS = require('./../dist/index').default;

function fixture(...args) {
  return path.join(__dirname, 'fixtures', ...args);
}

async function write({ input, output, plugin, outDir, options }) {

  const jsCodePath = path.join(outDir, 'bundle.js');

  const bundle = await rollup({
    input: fixture(input),
    plugins: [
      plugin,
    ],
  });

  await bundle.write({
    format: 'esm',
    file: path.join(outDir, output),
    sourcemap: true,
    sourcemapFile: path.join(outDir, `${output}.map`),
    ...options
  });

  return {
    jsCode() {
      return fs.readFile(jsCodePath, 'utf8');
    },
    hasRGBColorValues(bundle) {
      const file = fs.readFileSync(path.join(outDir, bundle), 'utf8');
      const style = file.match(/\`((.|\n)*)\`/gm)[0];
      return /(#abcefe)/gm.exec(style) == null ? true : false;
    },
    isMinified(bundle) {
      const file = fs.readFileSync(path.join(outDir, bundle), 'utf8');
      const style = file.match(/\`((.|\n)*)\`/gm)[0];
      return /\r|\n/.exec(style) == null ? true : false;
    },
    hasSourceMap(bundle) {
      const file = fs.readFileSync(path.join(outDir, bundle), 'utf8');
      return file.includes('sourceMappingURL');
    }
  };

}

test('should process with plugins declared in rollup.config.js', async () => {
  const res = await write({
    input: 'component.js',
    output: 'bundle.js',
    outDir: 'test/onExtract',
    plugin: inlinePostCSS({
      plugins: [require('postcss-csso'), require('postcss-rgb-plz')],
    }),
    options: {
      sourcemap: false
    },
  });
  expect(await res.hasRGBColorValues('bundle.js')).toBe(true);
  expect(await res.isMinified('bundle.js')).toBe(true);
  expect(await res.hasSourceMap('bundle.js')).toBe(false);
});

test('should process file with custom regex', async () => {
  const res = await write({
    input: 'custom.js',
    output: 'custom.js',
    outDir: 'test/onExtract',
    plugin: inlinePostCSS({
      styleRegex: /(?:foo`)((.|\n)+?)(?=(`(\n|;|,)))/gi,
    }),
    options: {},
  });
  expect(await res.hasRGBColorValues('custom.js')).toBe(true);
  expect(await res.isMinified('custom.js')).toBe(true);
});

test('should reference postcss.config.js', async () => {
  const res = await write({
    input: 'component.js',
    output: 'config.js',
    outDir: 'test/onExtract',
    plugin: inlinePostCSS({
      configPath: path.join(__dirname, 'config'),
    }),
    options: {},
  });
  expect(await res.hasRGBColorValues('config.js')).toBe(true);
  expect(await res.isMinified('config.js')).toBe(true);
});

test('should process multiple css declarations', async () => {
  const res = await write({
    input: 'multiple.js',
    output: 'multiple.js',
    outDir: 'test/onExtract',
    plugin: inlinePostCSS(),
    options: {},
  });
  expect(await res.hasRGBColorValues('multiple.js')).toBe(true);
  expect(await res.hasSourceMap('multiple.js')).toBe(true);
  // expect(await res.isMinified('multiple.js')).toBe(true);
});


