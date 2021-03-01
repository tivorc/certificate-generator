const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    main: path.resolve(__dirname, "src/js/app.js"),
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "js/[name].js",
    chunkFilename: "js/[id].js",
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "images/[name].[ext]",
              publicPath: "/",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "index.html"),
    }),
  ],
  devServer: {
    port: 9000,
    open: true,
    host: "192.168.0.15",
    disableHostCheck: true,
    contentBase: "./src",
  },
};
