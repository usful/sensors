const webpack = require('webpack');
const path = require('path');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    // Entry to your src
    main: ['babel-polyfill', path.resolve('src', `index.jsx`)],
    vendors: ['react', 'react-dom']
  },
  output: {
    path: path.join(__dirname, '/public/js/'),
    filename: `index.[chunkhash].js`,
    chunkFilename: '[chunkhash].js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.scss']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules\/(?!models)/,
        loader: 'babel-loader',
        query: {
          plugins: ['transform-runtime'],
          presets: ['es2015', 'stage-0', 'react']
        }
      },
      {
        // scss styles are loaded with modules local scope
        test: /\.scss$/,
        loader:
        'style-loader!css-loader?modules&localIdentName=' +
        '[local]---[hash:base64:5]!sass-loader!postcss-loader'
      }
    ]
  },
  plugins: [
    // Create the index.html file, exposing details
    // about the build (look further down), puts in the output dir
    new HtmlWebpackPlugin({
      template: path.resolve(`src/html/index.template.html`),
      inject: false,
      filename: path.resolve(`public/index.html`)
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      mangle: {
        except: ['webpackJsonp'],
        screw_ie8: true,
        keep_fnames: true
      },
      compress: {
        screw_ie8: true
      },
      comments: false
    }),
    // Ensures that the ID of the modules
    // stays the same between builds
    new webpack.HashedModuleIdsPlugin(),

    // Injects the manifest that keeps track
    // of modules registry (saves an HTTP request)
    new InlineManifestWebpackPlugin({
      name: 'webpackManifest'
    }),

    // Defines the vendors chunk and manifest to
    // be put into own files
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendors', 'manifest']
    })
  ],
  devtool: 'source-map'
};