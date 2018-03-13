const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './app/javascripts/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'build.js'
  },
  plugins: [
    // Copy our app's index.html to the build folder.
    new CopyWebpackPlugin([{
      from: './app/index.html',
      to: "index.html"
    }]),
    new CopyWebpackPlugin([{
      from: './app/stylesheets',
      to: 'stylesheets'
    }])
  ],
  module: {
    loaders: [{
      test: /\.css$/, // To load the css in react
      use: ['style-loader', 'css-loader'],
      exclude: /node_modules/,
      include: /app/
   }, {
      test: /\.jsx?$/, // To load the js and jsx files
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
         presets: ['es2015', 'react', 'stage-2']
      }
   }, {
      test: /\.json$/, // To load the json files
      loader: 'json-loader'
   }]
  }
}