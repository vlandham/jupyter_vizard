import ipywidgets as widgets
from traitlets import Unicode
from traitlets import default
from traitlets import Dict
from traitlets import Int

@widgets.register
class Network(widgets.DOMWidget):
    _model_name = Unicode('NetworkModel').tag(sync=True)
    _view_name = Unicode('NetworkView').tag(sync=True)

    _view_module = Unicode('jupyter_vizard').tag(sync=True)
    _model_module = Unicode('jupyter_vizard').tag(sync=True)

    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    _model_module_version = Unicode('^0.1.0').tag(sync=True)

    data = Dict({'nodes':[], 'links':[]}).tag(sync=True)
    r_key = Unicode('r').tag(sync=True)
    width = Int(400).tag(sync=True)
    height = Int(400).tag(sync=True)

    # def __init__(self, **kwargs):
    #     super(Network, self).__init__(**kwargs)

    @default('layout')
    def _default_layout(self):
        return widgets.Layout(height='400px', align_self='stretch')

    def set_data(self, js_data):
        self.data = js_data
