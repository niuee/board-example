const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;
const { merge } = require('webpack-merge');

const commonConfig = {
    devServer: {
      static: [
        path.resolve(__dirname, 'public/'), // Serve from the root public directory
        path.resolve(__dirname, 'public/physics/'), // Serve from the physics subdirectory
        // Add more directories as needed
      ],
      historyApiFallback: true, // Optional: for single-page applications
    },
};
const physicsConfig = require('./physics.webpack.config.js');
const rootConfig = require('./root.webpack.config.js');

module.exports = [
  rootConfig,
  physicsConfig,
  // commonConfig,
];

