const path = require("path");
const autoprefixer = require("autoprefixer");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { SourceMapDevToolPlugin } = require("webpack");

module.exports = {
    entry: {
        admin: {
            import: "./src/frontend/ts/admin.ts",
        },
        main: {
            import: "./src/frontend/ts/main.ts",
        },
        debug: { import: "./src/frontend/ts/debug.ts" },
        bootstrap: { import: "./src/frontend/ts/bootstrap.ts" },
    },
    devtool: false,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.(scss)$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: "css-loader" },
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [autoprefixer],
                            },
                        },
                    },
                    { loader: "sass-loader" },
                ],
            },
            {
                test: /\.js$/,
                use: "webpack-remove-debug",
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
        new WebpackManifestPlugin({
            map: (file) => {
                let extension = path.extname(file.name).slice(1);
                let name = file.name;
                if (["css", "js"].includes(extension)) {
                    name = `${extension}/basingse.${file.name}`;
                }

                if (extension === "map") {
                    extension = path.extname(file.name.slice(0, -4)).slice(1);
                    name = `${extension}/${file.name}`;
                }

                return {
                    ...file,
                    name,
                };
            },
        }),
        new MiniCssExtractPlugin({
            filename: "css/basingse.[name].[contenthash].css",
        }),
        new SourceMapDevToolPlugin({
            filename: "[file].map",
            publicPath: "assets/",
            append: (pathData, assetInfo) => {
                let parts = pathData.filename.split(".");
                parts.splice(parts.length - 2, 1);
                const bareName = parts.join(".");

                if (pathData.filename.endsWith(".css")) {
                    return `/*# sourceMappingURL=/assets/${bareName}.map */`;
                }
                return `//# sourceMappingURL=/assets/${bareName}.map`;
            },
        }),
    ],
    mode: "development",
    output: {
        filename: "js/basingse.[name].[contenthash].js",
        publicPath: "",
        path: path.resolve(__dirname, "src/basingse/assets/"),
        clean: true,
        library: ["Basingse", "[name]"],
    },
};
