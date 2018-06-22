const path = require('path');

module.exports = {
  entry: {
    app: './assets/experiment_webpack.js',
    franchise: './assets/franchise_graph_webpack.js'
  },
  output: {
    filename: '[name]_bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
