/* jshint node: true, esversion: 6, unused: true */
import pegjs from 'rollup-plugin-pegjs';

export default {
	input: 'src/index.js',
	plugins: [pegjs({cache: true})],
	output: {
		name: 'bibtex-parse',
		file: 'bibtex-parse.js',
		format: 'umd'
	}
};
