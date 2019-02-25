// rollup-plugin-inline-postcss.js
import * as cssesc from "cssesc";
import * as findup from "findup";
import * as path from "path";
import * as postcss from "postcss";
import { createFilter } from "rollup-pluginutils";

export default function inlinePostCSS(options: any = {}) {
  const filter = createFilter(options.include, options.exclude);
  const styleRegex = options.styleRegex ? options.styleRegex : /(css\`((.|\n)*)\`)/g;
  return {
    name: "inline-postcss",
    transform(code, id) {
      if (!filter(id)) {
          return;
      }
      if (!code.match(styleRegex)) {
          return;
      }
      let punc = code.match(styleRegex)[0][code.match(styleRegex)[0].length - 1];
      if (punc !== "," && punc !== ";") {
        punc = null;
      }
      try {
        let configFolder;
        if (!options.plugins) {
          configFolder = findup.sync(__dirname, "postcss.config.js");
        } else {
          configFolder = "";
        }
        const config = options.plugins ? options.plugins : require(path.join(configFolder, "postcss.config.js"))({
          env: process.env.NODE_ENV,
        });
        const css = code.match(styleRegex)[0].split("`")[1];
        const opts = { from: options.from ? path.join(process.cwd(), options.from) : id,
          to: options.to ? path.join(process.cwd(), options.to) : id,
          map: {
            inline: false,
            annotation: false,
          },
        };
        const outputConfig = options.plugins ? options.plugins : Object.keys(config.plugins)
          .filter((key) => config.plugins[key])
          .map((key) => require(key));
        return postcss(outputConfig)
          .process(css, opts)
          .then((result) => {
            code = code.replace(styleRegex, `\`${result.css}\`${punc ? punc : ""}`);
            const map = result.map
              ? JSON.parse((result as any).map)
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