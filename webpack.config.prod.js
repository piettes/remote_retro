var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var path = require("path");
var config = require("./config/config");

var HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: __dirname + '/app/index.html',
  filename: 'index.html',
  inject: 'body'
});
//

module.exports = {
  entry: "./app/index.tsx",
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "dist"),
    publicPath: '/'
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
  },

  module: {
    loaders: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      {test: /\.tsx?$/, exclude: /__tests__/, loader: "ts-loader"},
      {test: /\.css$/, loaders: ['style-loader', 'css-loader']},
      {test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000'}
    ]
  },
  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {
    // "react": "React",
    // "react-dom": "ReactDOM"
  },
  plugins: [HtmlWebpackPluginConfig,
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production"),
        FIREBASE_API_KEY: JSON.stringify(config.FIREBASE_API_KEY),
        FIREBASE_AUTH_DOMAIN: JSON.stringify(config.FIREBASE_AUTH_DOMAIN),
        FIREBASE_DATABASE_URL: JSON.stringify(config.FIREBASE_DATABASE_URL),
        FIREBASE_PROJECT_ID: JSON.stringify(config.FIREBASE_PROJECT_ID),
        FIREBASE_STORAGE_BUCKET: JSON.stringify(config.FIREBASE_STORAGE_BUCKET),
        FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(config.FIREBASE_MESSAGING_SENDER_ID)
      }
    }),
    new webpack.optimize.UglifyJsPlugin()
  ],
  devServer: {
    historyApiFallback: true
  }
};