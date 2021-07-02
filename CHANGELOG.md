# CHANGELOG

## 3.0.1

BREAKING CHANGE:

- fix: `styleDelineator` option changed to `styleDelimiter`. Ugh, English.

## 3.0.0

- feat: support multiple style declarations in same file
- feat: support inline `<style>` tags in custom `RexExp`
- feat: `styleDelineator` option allows users to specify the delineator for style declarations
- feat: `env` option allows users to specify environment via rollup.config.js, not just `NODE_ENV`
- feat: `configPath` options allows users to configure the path/to/postcss.config.js
- feat: bump minimum rollup version to ^2.0.0
- fix: support Function and Object exported from postcss.config.js
- fix: use `process.cwd()` instead of `__dirname` to find postcss.config.js
- fix: document missing options in README.md

BREAKING CHANGE:

- default `RegExp` has changed to support multiple style declarations
- `escapeTemplateString` option is deprecated

## 2.0.0

- feat: postcss bumped to ^8.0.0
- fix: issue that prevented custom regex

## 1.0.1

- added ability to pass postcss plugins with plugin options
- fixed issue when style regex match includes punctuation at end

## 1.0.0

- initial release
