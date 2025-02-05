const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
require('dotenv').config();

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
        new webpack.DefinePlugin({
            'process.env': JSON.stringify({
                REACT_APP_API_URL: 'https://smart-onboarding-8cbf3cd91007.herokuapp.com',
                REACT_APP_FRONTEND_URL: 'http://localhost:3000',
                REACT_APP_CASPIO_TOKEN: 'nyH5Xsn7mR2QsOFI3XycP1IZR1njoJZ9_2WWbX0l-QVZfQRMHTLFS2kSIjlnjTykGvoDRlLOvtz65ayqOSfW1_HwFF7phfQcCpPhyoVCRH47MeWj0BHhJ8kXAxkYI3K1twcBrYsgKGjzskZ9qVmqIoeLzkSWt-M0EyfUM0BtYYBPYedCEUCckCN84RdD3J-lMbge2o00xV-a3cxhgArAMEFneDhaAAWqc7Kvo34MaayGGHfqB3NBVvgMqdz3g0Zu6JnNl_p_gZis3-t8Fx9OlxUfDgEaI1CpnBu-A5t0KbMQnq1--vceJHEjam3mqKCNCwlK7wz0cWS3KtpTjAIPjRSo9elR8o0EN1Icelh4K8IftFx8yr_UsyDVhQLKEtdo8eYtWrElaJiomObA43effj5cB18ezUiLOmfpuVLUbQM'
            })
        }),
        new HtmlWebpackPlugin({
            template: './index.html'
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