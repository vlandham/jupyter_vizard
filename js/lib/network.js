var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');
var d3 = require("d3");
var network = require('./base_network');


function setupNodesEdges(rawData) {
  var nodesHash = {};
  var edgesHash = {};

  if (rawData.nodes) {
    rawData.nodes.forEach(function(n) {
      if (!n.name) {
        n.name = n.id;
      }
      nodesHash[n.id] = n;
    });
  }

  var allEdges = rawData.edges;
  // if there is no source attr,
  // assume an array of arrays
  if (allEdges && allEdges.length > 0 && !allEdges[0].source) {
    allEdges = allEdges.map(function(e) { return {source: e[0], target: e[1]}})
  }



  allEdges.forEach(function(e) {
    var source = {}
    var target = {}
    if (e.source) {
      source = nodesHash[e.source]
    }

    if (!source) {
      source = {'id': e.source, 'name': e.source}
      nodesHash[source.id] = source
    }

    if (e.target) {
      target = nodesHash[e.target]
    }

    if (!target) {
      target = {'id': e.target, 'name': e.target}
      nodesHash[target.id] = target
    }

    if (!e.id) {
      e.id = source.id + ':' + target.id
    }

    e.source = source;
    e.target = target;
    if (edgesHash[e.id]) {
      edgesHash[e.id].count += 1;
    } else {
      e.count = 1;

      edgesHash[e.id] = e;
    }

  })

  var data = { nodes: [], links: [] };

  data.nodes = Object.values(nodesHash);
  data.links = Object.values(edgesHash);

  console.log(data);
  return data;
}


var NetworkModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name : 'NetworkModel',
        _view_name : 'NetworkView',
        _model_module : 'jupyter_vizard',
        _view_module : 'jupyter_vizard',
        _model_module_version : '0.1.0',
        _view_module_version : '0.1.0'
    })
});

// Custom View. Renders the widget model.
var NetworkView = widgets.DOMWidgetView.extend({
  initialize: function() {
    NetworkView.__super__.initialize.apply(this, arguments);
    this.model.on('change:data', this.render, this);
  },

  render: function() {
    var data = this.model.get("data");
    if (!data) {
      data = {}
    }
    var edges = this.model.get("edges");
    if (edges && edges.length > 0) {

      data.edges = edges;

    }
    var myNetwork = network();
    var nData = setupNodesEdges(data);

    console.log('network data', nData)


    // this.value_changed();
    var cRoot = d3.select(this.el);
    myNetwork(this.el, nData);
  },

  updateScales: function() {
    var data = this.model.get("data");
    var rKey = this.model.get("r_key");

    var rMax = d3.max(data, function(d) { return d[rKey]; });
    this.rScale = d3.scaleLinear()
      .domain([0, rMax])
      .range([0, 20]);

  },

  value_changed: function() {
    // this.el.textContent = this.model.get('value');
    // var data = this.model.get("_model_data");
  }
});


module.exports = {
    NetworkModel : NetworkModel,
    NetworkView : NetworkView
};
