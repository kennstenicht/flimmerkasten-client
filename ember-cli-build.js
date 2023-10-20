'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const path = require('path');

function isProduction() {
  return EmberApp.env() === 'production';
}

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    autoImport: {
      forbidEval: true,
    },
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  const { Webpack } = require('@embroider/webpack');
  return require('@embroider/compat').compatBuild(app, Webpack, {
    packagerOptions: {
      cssLoaderOptions: {
        modules: {
          localIdentName: isProduction()
            ? '[sha512:hash:base64:5]'
            : '[path]__[local]',
          mode: (resourcePath) => {
            const hostAppLocation = 'node_modules/.embroider/rewritten-app';

            return resourcePath.includes(hostAppLocation) ? 'local' : 'global';
          },
          getLocalIdent: function (
            context,
            localIdentName,
            localName,
            options,
          ) {
            if (!options.context) {
              options.context = context.rootContext;
            }

            const componentPath = path
              .relative(options.context, context.resourcePath)
              .replace(/\\/g, '/')
              .replace('assets/styles/objects', 'o')
              .replace('components', 'c')
              .split('/');

            const filename = componentPath.pop();
            const name = filename.substring(0, filename.indexOf('.'));

            if (name !== 'styles') {
              componentPath.push(name);
            }

            let blockClass = componentPath.join('-');

            if (localName.startsWith('scope')) {
              return `${blockClass}${localName.replace('scope', '')}`;
            }

            return `${blockClass}__${localName}`;
          },
        },
        sourceMap: !isProduction(),
      },
      publicAssetURL: '/',
      webpackConfig: {
        module: {
          rules: [
            {
              exclude: /node_modules/,
              test: /\.css$/i,
              use: [
                {
                  loader: 'postcss-loader',
                  options: {
                    sourceMap: !isProduction(),
                    postcssOptions: {
                      config: './postcss.config.js',
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    },
    skipBabel: [
      {
        package: 'qunit',
      },
    ],
  });
};
