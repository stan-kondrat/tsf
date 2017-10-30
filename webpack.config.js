const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const debug = (process.env.NODE_ENV !== 'production');

const config = {
    entry: {
        tsf: './src/tsf.ts',
        examples: './examples/main.ts'
    },
    output: {
        library: 'TSF',
        filename: '[name]' + (debug ? '.js' : '.min.js'),
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.ts', '.js', '.css', '.html']
    },
    module: {
        rules: [
            { test: /\.ts$/, loaders: ['babel-loader', 'ts-loader'] },
            { test: /\.ts$/, use: 'tslint-loader', enforce: 'pre'},
            { test: /\.html$/, use: 'raw-loader' },
            { test: /\.css$/, use: ['style-loader', 'css-loader'] }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ template: 'examples/index.html' })
    ]
};

if (debug) {
    config.devtool = 'inline-source-map';
}

module.exports = config;
