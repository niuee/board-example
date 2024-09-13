import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { LicenseWebpackPlugin } from 'license-webpack-plugin';

// Add this import
import { fileURLToPath } from 'url';

// Add this line to define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const demoName = 'compositecurve';

export default 
{
    // devtool: 'source-map',
    mode: "development",
    entry: {index: path.resolve(__dirname, `./src/${demoName}/index.ts`)},
    module: {
      rules: [
        // {
        //   test: /\.(m?js)$/,
        //   enforce: "pre",
        //   use: ["source-map-loader"],
        // },
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
      path: path.resolve(__dirname, `public/${demoName}`),
    },
    plugins: [
        new HtmlWebpackPlugin({
            chunks: ['index'],
            template: `html-template/${demoName}.html`,
            filename: 'index.html',
            inject: 'body',
            path: path.resolve(__dirname, `public/${demoName}`),// Output directory
            publicPath: `/${demoName}/`
        }),
        // new LicenseWebpackPlugin()
    ],
}