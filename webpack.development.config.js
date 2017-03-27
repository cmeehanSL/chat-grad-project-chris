var webpack = require("webpack");
var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var OptimizeCssAssestsPlugin = require("optimize-css-assets-webpack-plugin");

var BUILD_DIR = path.resolve(__dirname, "src/client/public/build");
var APP_DIR = path.resolve(__dirname, "src/client/app");
var PUBLIC_DIR = path.resolve(__dirname, "src/client/public/scss");
process.noDeprecation = true;

var config = {
    entry: APP_DIR + "/index.jsx",
    output: {
        path: BUILD_DIR,
        filename: "bundle.js",
        publicPath: "/build/"
    },
    module: {
        loaders: [
            {
                test: /\.jsx?/,
                include: APP_DIR,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                  presets: ["react", "es2015", "stage-0"],
                  plugins: ["react-html-attrs", "transform-class-properties", "transform-decorators-legacy"],
                }
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [
                        "css-loader",
                        "sass-loader"
                    ]
                })
            }
        ]
    },
    plugins: [new ExtractTextPlugin("./main.css")]
};

module.exports = config;
