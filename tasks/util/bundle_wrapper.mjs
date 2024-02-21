import { build } from 'esbuild';

import config from '../../esbuild-config.mjs';
import browserifyAdapter from 'esbuild-plugin-browserify-adapter';

import transform from '../../tasks/compress_attributes.js';

/** Convenience bundle wrapper
 *
 * @param {string} pathToIndex path to index file to bundle
 * @param {string} pathToBunlde path to destination bundle
 * @param {object} opts
 *  Bundle options:
 *  - standalone {string}
 *  Additional option:
 *  - pathToMinBundle {string} path to destination minified bundle
 *  - noCompressAttributes {boolean} skip attribute meta compression?
 * @param {function} cb callback
 *
 * Outputs one bundle (un-minified) file if opts.pathToMinBundle is omitted.
 * Otherwise outputs two file: one un-minified bundle and one minified bundle.
 *
 * Logs basename of bundle when completed.
 */
export default async function _bundle(pathToIndex, pathToBundle, opts, cb) {
    opts = opts || {};

    config.entryPoints = [pathToIndex];
    config.outfile = pathToBundle || pathToMinBundle;
    if(!opts.noCompressAttributes) config.plugins.push(browserifyAdapter(transform));
    if(opts.noPlugins) consfig.noPlugins = [];

    var pathToMinBundle = opts.pathToMinBundle;
    var pending = (pathToMinBundle && pathToBundle) ? 2 : 1;

    if(pending === 2) {
        config.minify = true;
        config.outfile = pathToMinBundle;
        await build(config);
    }

    config.minify = !!(pathToMinBundle && pending === 1);
    config.outfile = pathToBundle || pathToMinBundle;
    config.sourcemap = false;

    await build(config);

    if(cb) cb();
}
