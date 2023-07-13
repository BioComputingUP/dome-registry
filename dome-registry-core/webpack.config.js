// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");

const isProduction = process.env.NODE_ENV === "production";

// Define generic configuration
const config = {
  entry: {
    // Define entry point, name
    index: "./index.ts"
  },
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    // Define a library (Universal Module Definition)
    library: "dome-registry-core",
    libraryTarget: "umd",
    umdNamedDefine: true,
  },
  plugins: [
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
      // {
      //   test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
      //   type: "asset",
      // },
      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
  },
};

// Define server configuration
const serverConfig = Object.assign({}, config, {
  target: 'node',
  output: Object.assign({}, config.output, {
    // Change output file
    filename: 'bundle.node.js',
  }),
});

// Define client configuration
const browserConfig = Object.assign({}, config, {
  target: 'web',  // Default option
});

// Define exports
module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  // Compile for both browser and server
  return [browserConfig, serverConfig];
};
