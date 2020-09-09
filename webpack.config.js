const path = require('path');
module.exports = {
    entry: {
        engine: path.resolve('', 'lib/engine.js'),
        container: path.resolve('', 'lib/container.js')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader'
            }
        ]
    },
    output: {
      path: path.resolve(__dirname, 'dist')
    },
};
