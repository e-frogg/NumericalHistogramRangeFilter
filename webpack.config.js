const path = require('path');
const FileManagerPlugin = require('filemanager-webpack-plugin');

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
    },
    plugins: [
        new FileManagerPlugin({
            events: {
                onEnd: {
                    copy: [
                        {source: 'build/*', destination: './public/build'},
                    ],
                }
            }
        }),
    ],

};

module.exports = baseConfig;
