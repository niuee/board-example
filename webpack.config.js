import path from 'path';

// Add this import
import { fileURLToPath } from 'url';

// Add this line to define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
import physicsConfig from './physics.webpack.config.js';
import rootConfig from './root.webpack.config.js';
import handdrawingConfig from './handdrawing.webpack.config.js';
import animationConfig from './animation.webpack.config.js';
import geographWebpackConfig from './geograph.webpack.config.js';
import d3IntegrationWebpackConfig from './d3-integration.webpack.config.js';

export default [rootConfig, physicsConfig, handdrawingConfig, animationConfig, geographWebpackConfig, d3IntegrationWebpackConfig];


