# rollup-plugin-inline-postcss

Rollup plugin that transforms inline styling with PostCSS

## Install

```bash
npm i rollup-plugin-inline-postcss --save-dev
yarn add rollup-plugin-inline-postcss --dev
```

## Usage

```js
import resolve from 'rollup-plugin-node-resolve';
import inlinePostCSS from 'rollup-plugin-inline-postcss';

export default {
  input: 'src/main.js',
  plugins: [resolve(), inlinePostCSS()],
};
```

## Options

| Property   | Description                                                              |
| ---------- | ------------------------------------------------------------------------ |
| include    | Files to include                                                         |
| exclude    | Files to exclude                                                         |
| env        | Environment variable, defaults to `process.env.NODE_ENV` where available |
| styleRegex | Custom regex for selecting CSS in file                                   |
| configPath | Path to directory that contains postcss.config.js                        |

## Template Literals in JavaScript

This plugin by default looks for a template literal in JavaScript (or TypeScript) and will process CSS found inside of the string. This is particularly useful for Web Components or other CSS in JavaScript situations. The default pattern is below. The regex can be configured by passing the styleRegex property in the plugin options.

```css
css`
  :host {
    display: block;
    background: rgba(24, 24, 24, 1);
    width: 200px;
    height: 200px;
    color: white;
    padding: 1em;
    border-radius: 8px;
  }
`
```

The default regex for selecting template literals in a file is:

```js
/(?:css`)((.|\n)+?)(?=(`(\n|;|,)))/gi;
```

## Config

This plugin honors `postcss.config.js` in the root directory and will look for environment variables based on the current `NODE_ENV`. The example postcss.config.js below demonstrates minifying CSS with the `postcss-csso` plugin only when the NODE_ENV is set to `prod`.

```js
module.exports = (ctx) => ({
  plugins: {
    'postcss-csso': ctx.env === 'prod' ? {} : false,
  },
});
```

## Development

`npm run build` compiles the plugin.

`npm run test` runs the tests.

`npm run version` versions the package, run with `SEMVER` environment variable et to either `patch`, `minor`, or `major`.
