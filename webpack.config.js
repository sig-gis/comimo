const path = require("path");
const fs = require("fs");

const outdir = "target/public/js";

module.exports = env => ({
  mode: env.dev ? "development" : "production",
  devtool: env.dev ? "eval-cheap-module-source-map" : "",
  watch: env.dev,
  entry: {
    collect:         path.resolve(__dirname, "src/js/collect/collect.js"),
    downloadData:    path.resolve(__dirname, "src/js/downloadData.js"),
    home:            path.resolve(__dirname, "src/js/home/home.js"),
    login:           path.resolve(__dirname, "src/js/login.js"),
    passwordRequest: path.resolve(__dirname, "src/js/passwordRequest.js"),
    passwordReset:   path.resolve(__dirname, "src/js/passwordReset.js"),
    register:        path.resolve(__dirname, "src/js/register.js"),
    userAccount:     path.resolve(__dirname, "src/js/userAccount.js"),
    verifyUser:      path.resolve(__dirname, "src/js/verifyUser.js")
  },
  output: {
    path: path.resolve(__dirname, outdir),
    filename: "[name].[hash].bundle.js",
    chunkFilename: "[chunkhash].chunk.js",
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
              "@babel/plugin-proposal-class-properties",
              "@babel/plugin-transform-runtime",
              "lodash"
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
      },
      {
        test: /\.svg$/,
        use: [{
          loader: "react-svg-loader",
          options: {
            jsx: false // We need false because we are still compiling to es6
          }
        }]
      }
    ]
  },
  plugins: [
    {
      apply: compiler => {
        compiler.hooks.beforeCompile.tap("BeforeCompilePlugin", () => {
          // Ensure that outdir exists.
          if (!fs.existsSync("./" + outdir)) {
            fs.mkdirSync("./" + outdir, {recursive: true});
          }
          // Remove old files to prevent conflicts.
          // Dev will have the old files removed at the beginning
          // so a browser refresh does not show stale data.
          if (env.dev) {
            fs.unlink("./target/entry-points.json", () => null);
            fs.readdirSync("./" + outdir)
              .forEach(f => fs.unlinkSync(path.join("./" + outdir, f)));
          }
        });
        compiler.hooks.emit.tap("EmitPlugin", () => {
          // Remove old files to prevent conflicts.
          // Production will have the old files removed immediately before
          // the new ones are created for less interruption.
          if (!env.dev) {
            fs.unlink("./target/entry-points.json", () => null);
            fs.readdirSync("./" + outdir)
              .forEach(f => fs.unlinkSync(path.join("./" + outdir, f)));
          }
        });
        compiler.hooks.done.tap("DonePlugin", stats => {
          // Map entrypoint name -> chunk files
          const entryPoints = Array.from(stats.compilation.entrypoints.entries());
          const newMap = entryPoints.reduce((acc, [name, ep]) =>
            ({...acc, [name]: ep.chunks.map(c => "/js/" + c.files[0])}),
                                            {});
          fs.writeFile("./target/entry-points.json", JSON.stringify(newMap), "utf8", e => {
            if (e) console.error(e);
          });
        });
      }
    }
  ],
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: "all"
    }
  }
});
