// rollup-plugin-inline-postcss.js
import path from 'path';
import postcss from 'postcss';
import { createFilter } from 'rollup-pluginutils';

export default function inlinePostCSS(options = {}) {
	const filter = createFilter(options.include, options.exclude);
	const styleRegex = options.styleRegex ? options.styleRegex : /css\`((?:\\.|[^"\\])*)\`/g;
	return {
		name: 'inline-postcss',
		transform(code, id) {
			if (!filter(id)) return;
			if (!code.match(styleRegex)) return;
			try {
				const config = require('./postcss.config')({
					env: process.env.NODE_ENV
				});
				const css = code.match(styleRegex)[0].split('`')[1];
				const opts = { from: options.from ? path.join(process.cwd(), options.from) : id,
											 to: options.to ? path.join(process.cwd(), options.to) : id,
											 map: {
													inline: false,
													annotation: false
											 }
										 };
				const outputConfig = Object.keys(config.plugins).filter(key => config.plugins[key]).map(key => require(key));
				return postcss(outputConfig)
					.process(css, opts)
					.then(result => {
						code = code.replace(styleRegex, `css\`${result.css}\``);
						const map = result.map
              ? JSON.parse(result.map)
              : { mappings: '' };
            return {
              code,
              map
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
