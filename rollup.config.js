/* jshint node: true, esversion: 6, unused: true */
import pegjs from 'rollup-plugin-pegjs';
 
export default {
	name: 'bibtex-parse',
	input: 'src/index.js',
	plugins: [pegjs()],
	output: {
		file: 'bibtex-parse.js',
		format: 'umd'
	}
};