const fs = require('fs');
const path = require('path');
const rollup = require('./../node_modules/rollup/dist/rollup').rollup;

const inlinePostCSS = require('./../dist/index').default;

function fixture(...args) {
  return path.join(__dirname, 'fixtures', ...args)
}

async function write({
  input,
  outDir,
  options
}) {

  const jsCodePath = path.join(outDir, 'bundle.js');
  const bundle = await rollup({
    input: fixture(input),
    plugins: [
      inlinePostCSS(options)
    ]
  })

  await bundle.write({
    format: 'cjs',
    file: path.join(outDir, 'bundle.js')
  })

  return {
      jsCode() {
        return fs.readFile(jsCodePath, 'utf8')
      },
      hasLineBreaksInCss() {
        const file = fs.readFileSync(path.join(outDir, 'bundle.js'), 'utf8');
        const style = file.match(/css\`((?:\\.|[^"\\])*)\`/g)[0];
        return /\r|\n/.exec(style) == null ? false : true;
      }
  }

}

test('inlineCSS', async () => {
  const res = await write({
    input: 'component.js',
    outDir: 'test/onExtract',
    options: {}
  })
  expect(await res.hasLineBreaksInCss()).toBe(false)
})
