const path = require("path");

module.exports = env => ({
  mode: env.dev ? "development" : "production",
  devtool: env.dev ? "eval-cheap-module-source-map" : "",
  watch: env.dev,
  entry: {
    downloadAll: path.resolve(__dirname, "src/js/downloadAll.js"),
    home: path.resolve(__dirname, "src/js/home/home.js"),
    login: path.resolve(__dirname, "src/js/login.js"),
    passwordForgot: path.resolve(__dirname, "src/js/passwordForgot.js"),
    passwordReset: path.resolve(__dirname, "src/js/passwordReset.js"),
    register: path.resolve(__dirname, "src/js/register.js"),
    userAccount: path.resolve(__dirname, "src/js/userAccount.js"),
    verifyUser: path.resolve(__dirname, "src/js/verifyUser.js")
  },
  output: {
    path: path.resolve(__dirname, "gmw/statics/js"),
    filename: "[name].js",
    library: "[name]",
    libraryTarget: "var"
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react"
            ],
            plugins: [
              "@babel/plugin-proposal-class-properties"
            ]
          }
        }
      },
      {
        test: /\.css$/, // TODO Find a css optimizer
        use: [
          "style-loader",
          {loader: "css-loader", options: {url: false}}
        ]
      }
    ]
  },
  optimization: {
    minimize: true,
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: "initial",
          name: "vendor",
          test: /node_modules/,
          enforce: true
        }
      }
    }
  }
});
