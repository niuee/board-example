const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;


module.exports = 
{
    devtool: 'source-map',
    mode: "development",
    entry: {index: path.resolve(__dirname, './src/physics/index.ts')},
    module: {
      rules: [
        {
          test: /\.(m?js)$/,
          enforce: "pre",
          use: ["source-map-loader"],
        },
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
            test: /\.css$/i,
            use: ["style-loader", "css-loader"],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'public/physics'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            chunks: ['index'],
            template: "src/html-template/index.html",
            filename: 'index.html',
            inject: 'body',
            path: path.resolve(__dirname, 'public/physics'),// Output directory
            publicPath: "/physics/"
        }),
        new LicenseWebpackPlugin()
    ],
}