# jlab-enhanced-cell-toolbar

[![Github Actions Status](https://github.com/jupyterlab-contrib/jlab-enhanced-cell-toolbar/workflows/Build/badge.svg)](https://github.com/jupyterlab-contrib/jlab-enhanced-cell-toolbar/actions?query=workflow%3ABuild)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/jupyterlab-contrib/jlab-enhanced-cell-toolbar/main?urlpath=lab/tree/Example.ipynb)
[![npm](https://img.shields.io/npm/v/@jlab-enhanced/cell-toolbar)](https://www.npmjs.com/package/@jlab-enhanced/cell-toolbar)
[![PyPI](https://img.shields.io/pypi/v/jlab-enhanced-cell-toolbar)](https://pypi.org/project/jlab-enhanced-cell-toolbar)
[![conda-forge](https://img.shields.io/conda/vn/conda-forge/jlab-enhanced-cell-toolbar)](https://anaconda.org/conda-forge/jlab-enhanced-cell-toolbar)

A cell toolbar for JupyterLab.

![Demonstration](https://raw.githubusercontent.com/jupyterlab-contrib/jlab-enhanced-cell-toolbar/main/docs/default_look.png)

There are some [Settings](#Settings) to tune the available buttons and the look of this extension.

## Requirements

- JupyterLab >= 3.0

For JupyterLab 2.x, have look [there](https://github.com/jupyterlab-contrib/jlab-enhanced-cell-toolbar/tree/2.x).

## Install

```bash
pip install jlab-enhanced-cell-toolbar
```

or

```bash
conda install -c conda-forge jlab-enhanced-cell-toolbar
```

## Uninstall

```bash
pip uninstall jlab-enhanced-cell-toolbar
```

or

```bash
conda remove -c conda-forge jlab-enhanced-cell-toolbar
```

## Settings

- _defaultTags_: The list of default available tags. For example, using the following settings:

```json
{
    "defaultTags": ["hide", "slide"]
}
```

![default tags](https://raw.githubusercontent.com/jupyterlab-contrib/jlab-enhanced-cell-toolbar/main/docs/default_tags.png)

- _leftMenu_ and _rightMenu_: The action buttons to be displayed on the left and right of the cell toolbar. For example, using the following settings:

```json
{
    "leftMenu": [
        {
          "command": "notebook:run-cell",
          "icon": "ui-components:run"
        }
    ],
    "rightMenu": [
        {
          "command": "notebook:delete-cell",
          "icon": "@jlab-enhanced/cell-toolbar:delete"
        }
    ]
}
```

![custom actions](https://raw.githubusercontent.com/jupyterlab-contrib/jlab-enhanced-cell-toolbar/main/docs/menus.png)

> The default JupyterLab icon names can be found in the [ui-components](https://github.com/jupyterlab/jupyterlab/blob/master/packages/ui-components/src/icon/iconimports.ts) package.

- _leftSpace_: The left empty white space width in pixel. For example, using the following settings:

```json
{
    "leftSpace": 48
}
```

![left_space](https://raw.githubusercontent.com/jupyterlab-contrib/jlab-enhanced-cell-toolbar/main/docs/left_space.png)

## Alternatives

Don't like what you see here? Try these other approaches:

- [jupyterlab-show-cell-tags](https://github.com/mje-nz/jupyterlab-show-cell-tags)
- [jupyterlab-colabinspired-codecellbtn](https://github.com/eddienko/jupyterlab-colabinspired-codecellbtn)
- [jupyterlab-codecellbtn](https://github.com/ibqn/jupyterlab-codecellbtn)

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jlab_enhanced_cell_toolbar directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm run build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```
