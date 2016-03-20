var path = require("path");
var webpack = require("webpack");
var isProd = process.env.NODE_ENV === 'production';

module.exports = function(opts) {

  var entry, plugins;

  //PROD mode
  if (opts.prod) {
    entry = [
      path.resolve(__dirname, 'src/index.js')
    ];

    plugins = [
      new webpack.optimize.UglifyJsPlugin({ //Minify JS for production use
        compress: {
          warnings: false
        }
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify("production")
        }
      })
    ];

  }
  //DEV mode
  else {
    entry = [
      "webpack-dev-server/client?http://localhost:8080", //Enable hot reloading for DEV
      "webpack/hot/only-dev-server",
      path.resolve(__dirname, 'src/index.js')
    ];
    plugins = [
      new webpack.HotModuleReplacementPlugin(),
    ];
  }

  return {
    entry: entry, //Compiled above - the JS file we start from
    output: {
      path: path.resolve(__dirname, 'build'),
      publicPath: '/build/',
      filename: "bundle.js" //Target for final compilation
    },
    //Also resolve JSX files
    resolve: {
      extensions: ['', '.js', '.jsx']
    },
    plugins: plugins, //Compiled above
    module: {
      loaders: [{
        //Activate babel loader
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['babel']
      }]
    }
  }
};
