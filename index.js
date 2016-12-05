const vm = require('vm');
const uuidV4 = require('uuid/v4');
const npm = require('npm-dependency-injection').default;
const isHyper = require('is-hyper');
const joinPath = require('path').join;
const homedir = require('os').homedir();
const shellEnv = require('shell-env');

const pluginsPath = joinPath(
  homedir,
  `.hyper${isHyper('<=0.8.0') ? 'term' : ''}_plugins`
);

const hooks = {
  decorateConfig: config => {
    if (
      config &&
      config.customPlugins &&
      typeof config.customPlugins.callback === 'function' &&
      typeof config.customPlugins.callback.toString === 'function'
    ) {
      const { customPlugins } = config;
      let dependencies = {};
      if (
        customPlugins.dependencies &&
        Array.isArray(customPlugins.dependencies)
      ) {
        dependencies = npm.sync(
          customPlugins.dependencies,
          {
            output: customPlugins.output,
            cwd: pluginsPath,
            env: shellEnv.sync(),
          }
        );
      }

      const id = uuidV4();
      global[id] = { hooks, config, dependencies, console };

      const script = new vm.Script(
        `(${customPlugins.callback.toString()})(global['${id}'])`
      );
      script.runInThisContext();

      delete global[id];
    }

    return config;
  },
};

module.exports = hooks;
