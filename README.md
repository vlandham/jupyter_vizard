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

## Development

### Installation

Ensure prerequisites are installed:

```
which npm
```

If you are missing npm, you can install (on a Mac) via homebrew:

```
brew install node npm
```

Then clone and install this package:

```
git clone https://github.com//jupyter_vizard.git
cd jupyter_vizard
pip install -e .
jupyter nbextension install --py --symlink --sys-prefix jupyter_vizard
jupyter nbextension enable --py --sys-prefix jupyter_vizard
```

### Updating

After a code change, it appears you can just run the install command again:

```
pip install -e .
```

After the reinstall, a running jupyter notebook with this widget installed will restart.

If it does not restart automatically, restart the Kernel using **Kernel ->  Restart**.

### Troubleshooting

If this does not provide a clean install, you can remove and reinstall this widget using the following commands:

```
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

```
# go into the js dir
cd ./js

# run webpack
npm run prepublish
```
