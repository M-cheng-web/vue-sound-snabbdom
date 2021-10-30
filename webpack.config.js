const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: path.join(__dirname, "www"),
    compress: false,
    host: '127.0.0.1',
    port: 8088,
    publicPath: "/xuni/"
  }
};
