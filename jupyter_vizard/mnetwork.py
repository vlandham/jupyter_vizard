import ipywidgets as widgets
from traitlets import Unicode
from traitlets import default
from traitlets import Dict
from traitlets import List
from traitlets import Int

@widgets.register
class MNetwork(widgets.DOMWidget):
    _model_name = Unicode('MNetworkModel').tag(sync=True)
    _view_name = Unicode('MNetworkView').tag(sync=True)

    _view_module = Unicode('jupyter_vizard').tag(sync=True)
    _model_module = Unicode('jupyter_vizard').tag(sync=True)

    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    _model_module_version = Unicode('^0.1.0').tag(sync=True)



    data = Dict({'nodes': [], 'edges': []}).tag(sync=True)
    edges = List([]).tag(sync=True)
    nodes = List([]).tag(sync=True)
    config = Dict({'layout': 'tensor'}).tag(sync=True)
    width = Int(400).tag(sync=True)
    height = Int(400).tag(sync=True)

    def __init__(self, **kwargs):
        super(MNetwork, self).__init__(**kwargs)
        self.modData = {}
        self._update_handlers = widgets.CallbackDispatcher()
        self.on_msg(self._handle_custom_msgs)

    @default('layout')
    def _default_layout(self):
        return widgets.Layout(height='500px', align_self='stretch')

    def set_data(self, js_data):
        self.data = js_data

    def get_update_data(self):
      return self.modData

    def _handle_custom_msgs(self, _, content, buffers=None):
      self.modData = content.get('data')
      self._update_handlers(self, content)

    def on_update(self, callback, remove=False):
        self._update_handlers.register_callback(callback, remove=remove)