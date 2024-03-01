const path = require('path');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

module.exports = {
    entry: './src/frontend/main.ts',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
        new WebpackManifestPlugin(),
    ],
    mode: 'development',
    output: {
        filename: '[name].[contenthash].js',
        publicPath: '',
        path: path.resolve(__dirname, 'src/basingse/assets/'),
        clean: true,
    },
};
