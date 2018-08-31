const path = require('path');

module.exports = {
  entry: {
    app: './assets/experiment_webpack.js',
    app_beta: './assets/experiment_webpack_beta.js',
    franchise: './assets/franchise_graph_webpack.js',
  },
  output: {
    filename: '[name]_bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
    {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }
  ]
}
};
