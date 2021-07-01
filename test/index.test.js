const fs = require('fs');
const path = require('path');
const rollup = require('./../node_modules/rollup/dist/rollup').rollup;

const inlinePostCSS = require('./../dist/index').default;

function fixture(...args) {
  return path.join(__dirname, 'fixtures', ...args);
}

async function write({ inputs, outDir }) {
  const jsCodePath = path.join(outDir, 'bundle.js');

  const bundleFromPlugins = await rollup({
    input: fixture(inputs[0]),
    plugins: [
      inlinePostCSS({
        plugins: [require('postcss-csso'), require('postcss-rgb-plz')],
      }),
    ],
  });

  const bundleFromPostCSSConfig = await rollup({
    input: fixture(inputs[2]),
    plugins: [
      inlinePostCSS({
        styleRegex: /(?:foo`)((.|\n)+?)(?=(`(\n|;|,)))/gi,
      }),
    ],
  });

  const bundleFromExternalPostCSSConfig = await rollup({
    input: fixture(inputs[0]),
    plugins: [
      inlinePostCSS({
        configPath: path.join(__dirname, 'config'),
      }),
    ],
  });

  const bundleWithMultipleCSS = await rollup({
    input: fixture(inputs[1]),
    plugins: [
      inlinePostCSS({}),
    ],
  });

  await bundleFromPlugins.write({
    format: 'esm',
    file: path.join(outDir, 'bundle.js'),
    sourcemap: true,
    sourcemapFile: path.join(outDir, 'bundle.js.map')
  });

  await bundleFromPostCSSConfig.write({
    format: 'esm',
    file: path.join(outDir, 'bundle.custom.js'),
  });

  await bundleFromExternalPostCSSConfig.write({
    format: 'esm',
    file: path.join(outDir, 'bundle.external.js'),
  });

  await bundleWithMultipleCSS.write({
    format: 'esm',
    file: path.join(outDir, 'bundle.multiple.js'),
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
  };
}

test('inline css is processed', async () => {
  const res = await write({
    inputs: ['component.js', 'multiple.js', 'custom.js'],
    outDir: 'test/onExtract',
    options: {},
  });
  expect(await res.hasRGBColorValues('bundle.js')).toBe(true);
  expect(await res.isMinified('bundle.js')).toBe(true);
  expect(await res.hasRGBColorValues('bundle.custom.js')).toBe(true);
  expect(await res.isMinified('bundle.custom.js')).toBe(true);
  expect(await res.hasRGBColorValues('bundle.external.js')).toBe(true);
  expect(await res.isMinified('bundle.external.js')).toBe(true);
  expect(await res.hasRGBColorValues('bundle.multiple.js')).toBe(true);
});
