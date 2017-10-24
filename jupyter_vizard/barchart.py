import ipywidgets as widgets
from traitlets import Unicode
from traitlets import default
from traitlets import List
from traitlets import Int

@widgets.register
class BarChart(widgets.DOMWidget):
    _model_name = Unicode('BarChartModel').tag(sync=True)
    _view_name = Unicode('BarChartView').tag(sync=True)

    _view_module = Unicode('jupyter_vizard').tag(sync=True)
    _model_module = Unicode('jupyter_vizard').tag(sync=True)

    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    _model_module_version = Unicode('^0.1.0').tag(sync=True)

    data = List([]).tag(sync=True)
    x_key = Unicode('x').tag(sync=True)
    width = Int(400).tag(sync=True)
    height = Int(400).tag(sync=True)

    # def __init__(self, **kwargs):
    #     super(BarChart, self).__init__(**kwargs)

    @default('layout')
    def _default_layout(self):
        return widgets.Layout(height='400px', align_self='stretch')

    def set_data(self, js_data):
        self.data = js_data
