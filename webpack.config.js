const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: './src/renderer.tsx',
    main: './src/main.ts',
    preload: './src/preload.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg|ico)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['app']
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'build/default-game-icon.svg',
          to: 'assets/default-game-icon.svg'
        },
        {
          from: 'build/icon.ico',
          to: 'assets/icon.ico'
        }
      ]
    })
  ],
  target: 'electron-renderer',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    port: 3000,
    hot: true
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
};
