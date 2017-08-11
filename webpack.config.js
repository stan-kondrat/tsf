const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
    entry: './examples/app.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.ts', '.js', '.css', '.html']
    },
    module: {
        rules: [
            { test: /\.ts$/, use: 'ts-loader' },
            { test: /\.ts$/, use: 'tslint-loader', enforce: 'pre'},
            { test: /\.html$/, use: 'raw-loader' },
            { test: /\.css$/, use: ['style-loader', 'css-loader'] }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ template: 'examples/index.html' })
    ]
};

if (process.env.NODE_ENV != 'production') {
    config.devtool = 'inline-source-map';
}

module.exports = config;
