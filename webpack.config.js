const path = require('path');

const baseConfig = {
    entry: './src/NumericalHistogramRangeFilter.js',
    output: {
        path: __dirname + '/build',
        filename: 'NumericalHistogramRangeFilter.js',
        libraryTarget: 'umd',
        library: 'NHRF',
    },
    module: {
        rules: [
            {
                test: /\.(scss|css)$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    }
};

module.exports = baseConfig;
