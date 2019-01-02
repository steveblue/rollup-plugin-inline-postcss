// rollup-plugin-inline-postcss.js
import * as findup from "findup";
import * as path from "path";
import * as postcss from "postcss";
import { createFilter } from "rollup-pluginutils";

export interface InlinePostCSSOptions {
    from?: string;
    to?: string;
    include?: string[];
    exclude?: string[];
    styleRegex?: RegExp;
    failOnError?: any;
}

export interface IPostCSSOptions {
    from: string;
    to: string;
    map: {
      inline: boolean;
      annotation: boolean;
    };
}

export default function inlinePostCSS(options?: InlinePostCSSOptions) {
 if (!options) { options = {}; }
 const filter = createFilter(options.include, options.exclude);
 const styleRegex: RegExp = options.styleRegex ? options.styleRegex : /css\`((?:\\.|[^"\\])*)\`/g;
 return {
    name: "inline-postcss",
    transform(code: string, id: string) {
      if (!filter(id)) { return; }
      if (!code.match(styleRegex)) { return; }
      try {
            const configFolder: string = findup.sync(__dirname, "postcss.config.js");
            const config: any = require(path.join(configFolder, "postcss.config.js"))({
              env: process.env.NODE_ENV,
            });
            const css: string = code.match(styleRegex)[0].split("`")[1];
            const opts: IPostCSSOptions = { from: options.from ? path.join(process.cwd(), options.from) : id,
                            to: options.to ? path.join(process.cwd(), options.to) : id,
                            map: {
                                inline: false,
                                annotation: false,
                            },
                          };
            const outputConfig = Object.keys(config.plugins).filter((key) => config.plugins[key])
                                                            .map((key) => require(key));
            return postcss(outputConfig)
                  .process(css, opts)
                  .then((result: any) => {
                    code = code.replace(styleRegex, `css\`${result.css}\``);
                    const map = result.map
                      ? JSON.parse(result.map)
                      : { mappings: "" };
                    return {
                      code,
                      map,
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
