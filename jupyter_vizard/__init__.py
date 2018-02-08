from ._version import version_info, __version__

from .example import *
from .barchart import *
from .network import *
from .mnetwork import *

def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'static',
        'dest': 'jupyter_vizard',
        'require': 'jupyter_vizard/extension'
    }]
