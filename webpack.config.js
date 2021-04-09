const path = require("path");

module.exports = env => ({
    mode: env.dev ? "development" : "production",
    devtool: env.dev ? "eval-cheap-module-source-map" : "",
    watch: env.dev,
    entry: {
        home: path.resolve(__dirname, "src/js/Home.js")
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
            }
        ]
    },
    optimization: {
        minimize: true
    }
});
