// rollup-plugin-inline-postcss.js
import * as findup from 'findup';
import * as path from 'path';
import { createFilter } from 'rollup-pluginutils';

const postcss = require('postcss');

export default function inlinePostCSS(options: any = {}) {
  const filter = createFilter(options.include, options.exclude);
  const styleRegex = options.styleRegex
    ? options.styleRegex
    : /(?:css`)((.|\n)+?)(?=(`(\n|;|,)))/gi;
  const hasCustomRegex = options.styleRegex ? true : false;
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
            env: process.env.NODE_ENV,
          });
        }

        const outputConfig = options.plugins
          ? options.plugins
          : Object.keys(config.plugins)
            .filter((key) => config.plugins[key])
            .map((key) => require(key));

        const matches = code.match(styleRegex);

        return Promise.all(matches.map(css => postcss(outputConfig)
          .process(css.split('`')[1], postcssOptions))).then((transforms: any) => {
            let mappings = '';
            transforms.forEach((transform, index) => {
              code = code.replace(matches[index].split('`')[1], transform.css);
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
