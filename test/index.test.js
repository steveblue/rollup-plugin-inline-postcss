const fs = require('fs');
const path = require('path');
const rollup = require('./../node_modules/rollup/dist/rollup').rollup;

const inlinePostCSS = require('./../dist/index').default;

function fixture(...args) {
  return path.join(__dirname, 'fixtures', ...args);
}

async function write({ input, outDir }) {
  const jsCodePath = path.join(outDir, 'bundle.js');

  const bundleFromPlugins = await rollup({
    input: fixture(input),
    plugins: [
      inlinePostCSS({
        escapeTemplateString: true,
        plugins: [require('postcss-csso'), require('postcss-rgb-plz')],
      }),
    ],
  });

  const bundleFromPostCSSConfig = await rollup({
    input: fixture(input),
    plugins: [
      inlinePostCSS({
        styleRegex: /css\`((.|\n)*)\`(;)/gm,
        escapeTemplateString: true,
      }),
    ],
  });

  const bundleFromExternalPostCSSConfig = await rollup({
    input: fixture(input),
    plugins: [
      inlinePostCSS({
        escapeTemplateString: true,
        configPath: path.join(__dirname, 'config'),
      }),
    ],
  });

  await bundleFromPlugins.write({
    format: 'esm',
    file: path.join(outDir, 'bundle.js'),
  });

  await bundleFromPostCSSConfig.write({
    format: 'esm',
    file: path.join(outDir, 'bundle.config.js'),
  });

  await bundleFromExternalPostCSSConfig.write({
    format: 'esm',
    file: path.join(outDir, 'bundle.external.js'),
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
    input: 'component.js',
    outDir: 'test/onExtract',
    options: {},
  });
  expect(await res.hasRGBColorValues('bundle.js')).toBe(true);
  expect(await res.isMinified('bundle.js')).toBe(true);
  expect(await res.hasRGBColorValues('bundle.config.js')).toBe(true);
  expect(await res.isMinified('bundle.config.js')).toBe(true);
  expect(await res.hasRGBColorValues('bundle.external.js')).toBe(true);
  expect(await res.isMinified('bundle.external.js')).toBe(true);
});
