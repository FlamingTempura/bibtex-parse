/* jshint node: true, esversion: 6, unused: true */
import pegjs from 'rollup-plugin-pegjs';

export default {
	input: 'src/index.js',
	plugins: [pegjs()],
	output: {
		name: 'bibtex-parse',
		file: 'bibtex-parse.js',
		format: 'umd'
	}
};
