const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1
                        }
                    },
                    'postcss-loader'
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            inject: true
        }),
        new webpack.DefinePlugin({
            'process.env': JSON.stringify({
                REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'https://smart-onboarding-8cbf3cd91007.herokuapp.com',
                REACT_APP_FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000',
                CASPIO_TOKEN: process.env.REACT_APP_CASPIO_TOKEN || ''
            })
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        historyApiFallback: true,
        port: 3000,
        hot: true,
        open: true
    },
    devtool: 'source-map'
};