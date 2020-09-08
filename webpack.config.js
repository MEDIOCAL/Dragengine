const path = require('path');
module.exports = {
    entry: path.resolve('', 'lib/engine.js'),
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader'
            }
        ]
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js'
    },
};
