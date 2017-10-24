var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');

//import * as d3 from 'd3';
var d3 = require("d3");

var BarChartModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name : 'BarChartModel',
        _view_name : 'BarChartView',
        _model_module : 'jupyter_vizard',
        _view_module : 'jupyter_vizard',
        _model_module_version : '0.1.0',
        _view_module_version : '0.1.0'
    })
});

// Custom View. Renders the widget model.
var BarChartView = widgets.DOMWidgetView.extend({
  initialize: function() {
    BarChartView.__super__.initialize.apply(this, arguments);
    this.model.on('change:data', this.render, this);
  },

  render: function() {
    this.updateScales();
    console.log('render bar')
    var data = this.model.get("data");
    var width = this.model.get('width');
    var height = this.model.get('width');
    var xKey = this.model.get('x_key');
    console.log(data)
    // this.value_changed();
    var cRoot = d3.select(this.el);
    var svg = cRoot.append('svg')
      .attr('width', width)
      .attr('height', height)

    var that = this;
    svg.selectAll('.bar')
      .data(data).enter()
      .append('rect')
      .classed('bar', true)
      .attr('x', 0)
      .attr('y', function(d,i) { return that.yScale(i); })
      .attr('width', function(d) { return that.xScale(d[xKey]); })
      .attr('height', this.yScale.bandwidth())
  },

  updateScales: function() {
    var data = this.model.get("data");
    var xKey = this.model.get("x_key");
    var width = this.model.get('width');
    var height = this.model.get('height');

    var xMax = d3.max(data, function(d) { return d[xKey]; });
    this.xScale = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, width]);

    this.yScale = d3.scaleBand()
      .domain(d3.range(data.length))
      .range([0, height]);
  },

  value_changed: function() {
    // this.el.textContent = this.model.get('value');
    // var data = this.model.get("_model_data");
  }
});


module.exports = {
    BarChartModel : BarChartModel,
    BarChartView : BarChartView
};
