// Entry point for the notebook bundle containing custom model definitions.
//
// Setup notebook base URL
//
// Some static assets may be required by the custom widget javascript. The base
// url for the notebook is not known at build time and is therefore computed
// dynamically.
__webpack_public_path__ = document.querySelector('body').getAttribute('data-base-url') + 'nbextensions/jupyter_vizard/';

var barchart = require('./barchart.js');
var example = require('./example.js');
var network = require('./network.js');
var mnetwork = require('./mnetwork.js');
// Export widget models and views, and the npm package version number.
module.exports = Object.assign({}, example, barchart, network, mnetwork)
module.exports['version'] = require('../package.json').version;
