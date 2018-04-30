const path = require('path');

module.exports = {
  entry: './assets/experiment_webpack.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
