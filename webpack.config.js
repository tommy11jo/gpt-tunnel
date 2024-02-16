const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: {
    contentScript: "./src/index.ts",
    backgroundScript: "./src/background.ts",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // prepare for using react in popup for ext configuration
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
          },
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".tsx", ".jsx"],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "./manifest.json", to: "./manifest.json" }],
    }),
  ],
}
