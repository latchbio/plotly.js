import { build } from 'esbuild';

import esbuildConfig from '../../esbuild-config.js';
import browserifyAdapter from 'esbuild-plugin-browserify-adapter';

import transform from '../../tasks/compress_attributes.js';

var basePlugins = esbuildConfig.plugins;

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

    var config = {...esbuildConfig};

    config.entryPoints = [pathToIndex];
    config.outfile = pathToBundle || pathToMinBundle;
    if(!opts.noCompressAttributes) {
        config.plugins = basePlugins.concat([browserifyAdapter(transform)]);
    }

    if(opts.noPlugins) config.plugins = [];
    var pathToMinBundle = opts.pathToMinBundle;
    var pending = (pathToMinBundle && pathToBundle) ? 2 : 1;

    config.minify = !!(pathToMinBundle && pending === 1);
    config.outfile = pathToBundle || pathToMinBundle;
    config.sourcemap = false;
    build(config).then(function() {
        if(pending === 2) {
            config.minify = true;
            config.outfile = pathToMinBundle;
            // config.sourcemap = true;
            build(config).then(function() {
                if(cb) cb();
            });
        } else {
            if(cb) cb();
        }
    });
}
