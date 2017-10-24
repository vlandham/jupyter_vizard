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
    render: function() {
      var data = this.model.get("model_data");
      // this.value_changed();
      // this.model.on('change:value', this.value_changed, this);
      var cRoot = d3.select(this.el);
      var svg = cRoot.append('svg')
        .attr('width', 400)
        .attr('height', 400)

      svg.append('circle')
        .attr('r', 8)
        .attr('cx', 20)
        .attr('cy', 20)
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
