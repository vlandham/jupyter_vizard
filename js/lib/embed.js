// Entry point for the unpkg bundle containing custom model definitions.
//
// It differs from the notebook bundle in that it does not need to define a
// dynamic baseURL for the static assets and may load some css that would
// already be loaded by the notebook otherwise.

var barchart = require('./barchart.js');
var example = require('./example.js');
var network = require('./network.js');
// Export widget models and views, and the npm package version number.
module.exports = Object.assign({}, example, barchart, network)

module.exports['version'] = require('../package.json').version;
