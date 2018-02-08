var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');
var d3 = require("d3");
var network = require('./mnetwork_base');


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

  var data = { nodes: [], edges: [] };

  data.nodes = Object.values(nodesHash);
  data.edges = Object.values(edgesHash);

  console.log(data);
  return data;
}


var MNetworkModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name : 'MNetworkModel',
        _view_name : 'MNetworkView',
        _model_module : 'jupyter_vizard',
        _view_module : 'jupyter_vizard',
        _model_module_version : '0.1.0',
        _view_module_version : '0.1.0'
    })
});

// Custom View. Renders the widget model.
var MNetworkView = widgets.DOMWidgetView.extend({
  initialize: function() {
    MNetworkView.__super__.initialize.apply(this, arguments);
    this.model.on('change', this.render, this);
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

    var nodes = this.model.get("nodes");
    if (nodes && nodes.length > 0) {
      data.nodes = nodes;
    }

    var myNetwork = network();
    var nData = setupNodesEdges(data);

    var config = this.model.get("config");

    console.log('network data', nData)
    console.log('config', config)


    // this.value_changed();
    var cRoot = d3.select(this.el);
    myNetwork(this.el, nData, config);
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
    MNetworkModel : MNetworkModel,
    MNetworkView : MNetworkView
};
