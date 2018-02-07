# jupyter_vizard

A Custom Jupyter Widget Library

## Installation

**NOTE:** This package is not currently on pip. In the future, this will work.
For now, the _Development_ instructions must be used.

To install use pip:

```
pip install jupyter_vizard
jupyter nbextension enable --py --sys-prefix jupyter_vizard
```

## Usage

The jupyter_vizard package provides a number of interesting bespoke visuals.

Start by importing the `jupyter_vizard` package in your Jupyter Notebook.
Here, we use the alias `viz`:

```python
import jupyter_vizard as viz
```

Then use one or more of the included visualizations, detailed below.

### Network

The `network` visualization provides a quick way to show a force-directed network, complete with zoom and mouseover capabilities.

The network expects one of a few very simple input data structures. The most direct is a dictionary with a `nodes` array and a `edges` array:

```python
mnetwork = {"nodes": [{"id": 'a'}, {"id": 'b'}, {"id": 'c'}],
            "edges": [{"source": "a", "target": "b"}, {"source": "a", "target": "c"}]}

network = viz.Network
network(data=mnetwork)
```

We can see that each dictionary in the `nodes` array should have, at a minimum, a unique `id` attribute.
The `edges` array contains dicts with `source` and `target` values that reference the `id` of nodes.

This data structure is passed into the `network()` for visualization using the `data=` input parameter.

A more compact _alternative_ is to just provide an array of edges, or an "edgelist" with the format: `[sourceId, targetId]`.

This can be passed into `network()` using `edges=`, as shown below:

```python
edges = [['a', 'b'], ['a', 'c'],
         ['c', 'd'], ['a', 'c'],
         ['a', 'f'], ['a', 'e'],
         ['c', 'd'], ['c', 'd'],
         ['a', 'e'], ['c', 'd'],
        ]

network = viz.Network
network(edges=edges)
```

## Development

### Installation

Ensure prerequisites are installed:

```
which npm
```

If you are missing npm, you can install (on a Mac) via homebrew:

```bash
brew install node npm
```

Then clone and install this package:

```bash
git clone https://github.com//jupyter_vizard.git
cd jupyter_vizard
pip install -e .
jupyter nbextension install --py --symlink --sys-prefix jupyter_vizard
jupyter nbextension enable --py --sys-prefix jupyter_vizard
```

### Updating

After a code change, it appears you can just run the install command again:

```bash
pip install -e .
```

After the reinstall, a running jupyter notebook with this widget installed will restart.

If it does not restart automatically, restart the Kernel using **Kernel ->  Restart**.

### Troubleshooting

If this does not provide a clean install, you can remove and reinstall this widget using the following commands:

```bash
# uninstall from jupyter
jupyter nbextension uninstall --py --sys-prefix jupyter_vizard

# remove static directory
rm -rf ./jupyter_vizard/static

# rerun install
pip install -e .

# reinstall into jupyter
jupyter nbextension install --py --symlink --sys-prefix jupyter_vizard
jupyter nbextension enable --py --sys-prefix jupyter_vizard
```

You can also check the compilation of just the Javascript source by running:

```bash
# go into the js dir
cd ./js

# run webpack
npm run prepublish
```

## Architecture

Here, we summarize how the codebase is put together.

For another take, checkout the [ipywidgets hello world tutorial](http://ipywidgets.readthedocs.io/en/stable/examples/Widget%20Custom.html)

Jupyter Widgets can be built using the [ipywidgets](https://ipywidgets.readthedocs.io/en/latest/#) python package.

This particular repo was bootstrapped using the [widget-cookiecutter](https://github.com/jupyter-widgets/widget-cookiecutter) template for [cookiecutter](https://github.com/audreyr/cookiecutter).

For our purposes, we can think of a Jupyter Widget as a single interactive visualization. Each visualization has a python portion and a Javascript portion.

Let's look at each of these pieces in more detail!

### Python Side

As these visuals need to consume data from an interactive notebook running python, it's not too surprising that some python integration is required.

Specifically, each widget needs a new python class, which is a subclass of ipywidget's [DOMWidget](https://github.com/jupyter-widgets/ipywidgets/blob/master/ipywidgets/widgets/domwidget.py).

In this codebase, each of these classes is in the `jupyter_vizard/` sub-directory. And each is contained in its own file.
[Here is python code for network](https://github.com/vlandham/jupyter_vizard/blob/master/jupyter_vizard/network.py).

This class's main responsibilities include:

* Specify the JS "View" and "Model" for the widget (see below).
* Indicate what data the widget can have passed into it and be accessible in the JS side.

It handles these responsibilities by using [traitlets](https://github.com/ipython/traitlets) to define shared attributes. Traitlets provide strongly typed variables that can be "synced", or propagated, to the JS portion of the code.

To indicate the model and view of your widget, the `_view_name` and `_model_name` attributes need to be set, as well as the `_view_module` and `_view_module_version`.

Here is an example of setting these attributes to Unicode traitlets:

```python
class Network(widgets.DOMWidget):
    _model_name = Unicode('NetworkModel').tag(sync=True)
    _view_name = Unicode('NetworkView').tag(sync=True)
    # ...
```

The `sync` tag appears to be manditory to make the attribute accessible from the JS side.

Data variables can be defined in very much the same way. In the same class, we indicate these with other traitlet types:

```python
class Network(widgets.DOMWidget):
    # ...
    data = Dict({'nodes': [], 'edges': []}).tag(sync=True)

    width = Int(400).tag(sync=True)
    height = Int(400).tag(sync=True)
```

### Javascript Side

For the JS portion of the widget, you need to define (at minimum) a Model and View class. Both are defined using [BackboneJS](http://backbonejs.org/) classes.

The **Model** extends from `widgets.DOMWidgetModel` which in turn extends from [Backbone.Model](http://backbonejs.org/#Model). In the model, we want to list all the traitlets we defined in the widget's python class (including `_view_name` et. al.), and provide default values.

The model name must match our `_model_name` attribute.

The **View** is a [Backbone.View](http://backbonejs.org/#View) and extends from `widgets.DOMWidgetView`. This is where all the display logic goes.

The basic paradigm is to hook up to the associated Model's `model.on('change:name')` method to trigger actions (like visualizing) when the provided data changes.

Here is an example portion of the Network's View that shows us calling the `render` method when its model's `data` changes:

```js
var NetworkView = widgets.DOMWidgetView.extend({
  // constructor method
  initialize: function() {
    // ensure base classes are initialized.
    NetworkView.__super__.initialize.apply(this, arguments);
    // when data changes, call render()
    this.model.on('change:data', this.render, this);
  },
  render: function() {
    // get access to the updated data
    var data = this.model.get("data");
    // display data.
  }
```
