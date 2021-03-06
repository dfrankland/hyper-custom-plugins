# `hyper-custom-plugins`

Create Hyper.app plugins from Hyper.app's configuration file `~/.hyper.js`.

## Why?

Sometimes all you want is a small change to the configuration or plugins in
Hyper.app, but you don't want to have to create a whole plugin for it! This
plugin makes it much easier to write mini-plugins that can do anything a normal
plugin can do.

## How to Use It

Just add the following properties to your `~/.hyper.js`.

### `config.customPlugins`

The object containing the properties below:

#### `config.customPlugins.output`

A boolean value; whether to print to `STDOUT` the `npm` commands' output.

#### `config.customPlugins.dependencies`

An optional array of `npm` module dependencies that will be used in your
plugins. These `npm` modules will be dynamically installed and passed to
`config.customPlugins.callback` afterwards.

#### `config.customPlugins.callback`

A function to be stringified and run in a Node.js `vm`. It will have access to
the `global` variable from `hyper-custom-plugins` and the object, containing the
following properties, as an argument:

*   `hooks`: An object that references `hyper-custom-plugins`' `module.exports`.
    Mutate this object to add other Hyper.app hooks. Overriding the
    `decorateConfig` property will prevent the `config.customPlugins.callback`
    function from running until a new session is created or "Update Plugins" is
    run.

*   `config`: The initial `config` object after it has been decorated by other
    plugins, unless `hyper-custom-plugins` is the first in the `plugins` array
    inside `~/.hyper.js`. Mutate this object to change `config`.

*   `dependencies`: An object with keys that will be the name of the `npm`
    modules passed in `config.customPlugins.dependencies` and values that will
    be the `npm` modules after being `require`d.

*   `module`: A reference to `hyper-custom-plugins`' `module` object.

## Examples

1.  Setting the terminal bell sound to be an MP3 file that I sync with
    [`hyper-sync-settings`][1] would be awesome! So let's do that:

    ```js
    module.exports = {
      config: {
        bell: 'SOUND',
        bellSoundURL: undefined,
        customPlugins: {
          callback: ({ config, module }) => {
            const homedir = module.require('os').homedir();
            const joinPath = module.require('path').join;
            config.bellSoundURL = joinPath(
              homedir,
              '.hyper_plugins',
              '.hyper-sync-settings',
              'pokemon-rby-level-up.mp3'
            );
          },
        },
      },
    };
    ```

2.  I like to use the theme [`hyperterm-material`][2], but I wish that the
    `config.backgroundColor` it sets was slightly transparent! Instead of
    creating a whole module just for this purpose, I just use
    `hyper-custom-plugins` like this:

    ```js
    module.exports = {
      config: {
        customPlugins: {
          output: false,
          dependencies: ['color'],
          callback: ({ hooks, config, dependencies, module }) => {
            const { color: Color } = dependencies;
            const { backgroundColor } = config;
            const newBackground = Color(backgroundColor).fade(0.3).rgb().string();
            config.backgroundColor = newBackground;
          },
        },
      },
      plugins: [
        'hyperterm-material',
        'hyper-custom-plugins'
      ],
    };
    ```

[1]: https://github.com/dfrankland/hyper-sync-settings
[2]: https://github.com/dperrera/hyperterm-material
