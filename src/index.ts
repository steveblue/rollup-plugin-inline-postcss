// rollup-plugin-inline-postcss.js
import * as findup from 'findup';
import * as path from 'path';
import { createFilter } from 'rollup-pluginutils';

const postcss = require('postcss');

declare interface InlinePostCSSOptions {
  configPath?: string;
  include?: string[];
  exclude?: string[];
  env?: string;
  failOnError?: boolean;
  from?: string;
  plugins?: any[];
  styleDelimiter?: string;
  styleRegex?: RegExp;
  to?: string;
}

export default function inlinePostCSS(options: InlinePostCSSOptions = {}) {
  const filter = createFilter(options.include, options.exclude);
  const styleRegex = options.styleRegex
    ? options.styleRegex
    : /(?:css`)((.|\n)+?)(?=(`(\n|;|,)))/gi;

  return {
    name: 'inline-postcss',
    transform(code, id) {
      if (!filter(id)) {
        return;
      }

      if (!code.match(styleRegex)) {
        return;
      }

      try {
        let configPath;

        const env = process.env.NODE_ENV
          ? options.env
            ? options.env
            : null
          : null;

        const postcssOptions = {
          from: options.from ? path.join(process.cwd(), options.from) : id,
          to: options.to ? path.join(process.cwd(), options.to) : id,
          map: {
            inline: false,
            annotation: false,
          },
        };

        if (!options.plugins) {
          configPath = options.configPath
            ? options.configPath
            : findup.sync(process.cwd(), 'postcss.config.js');
        } else {
          configPath = '';
        }

        let config = options.plugins
          ? options.plugins
          : require(path.join(configPath, 'postcss.config.js'));

        if (typeof config === 'function') {
          config = config({
            env,
          });
        }

        const outputConfig = options.plugins
          ? options.plugins
          : Object.keys(config.plugins)
              .filter((key) => config.plugins[key])
              .map((key) => require(key));

        const styleDelimiter = options.styleDelimiter
          ? options.styleDelimiter
          : /`/;

        let matches = code.match(styleRegex);

        return Promise.all(
          matches.map((css: string) =>
            postcss(outputConfig).process(
              styleDelimiter ? css.split(styleDelimiter)[1] : css,
              postcssOptions
            )
          )
        ).then((transforms: any[]) => {
          transforms.forEach((transform, index) => {
            code = code.replace(
              styleDelimiter
                ? matches[index].split(styleDelimiter)[1]
                : matches[index],
              transform.css
            );
          });
          return {
            code,
            map: null,
          };
        });
      } catch (error) {
        if (options.failOnError) {
          this.error(error.message);
        } else {
          this.warn(error.message);
        }
      }
    },
  };
}
