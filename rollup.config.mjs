/* eslint-disable no-undef */
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import {visualizer} from "rollup-plugin-visualizer";

export default [
	{
		input: "lib-web/src/index-web.js",
		output: {
      file: "dist/reader-ddfcsv.js",
			name: "DDFCsvReader",
      format: "umd",
			sourcemap: true
    },
		plugins: [
			nodeResolve({ browser: true }),
			commonjs(),
			esbuild({
				minify: true,
				keepNames: true, // prevent renaming of class/function identifiers
				target: "es2020", // bump as high as your audience allows
				legalComments: "none"
			}),
			visualizer({
				filename: "./dist/stats.html"
			}),	
		]
	}
];