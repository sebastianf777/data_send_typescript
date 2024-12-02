const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: {
    popup: './src/popup.ts',
    background: './src/background.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      "fs": false, // Add this to avoid fs module errors
      "path": false, // Add this to avoid path module errors
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new Dotenv({
      path: './.env', // Specify your .env file here
      safe: false, // Set to false if you don't want to enforce .env.example
    }),
  ],
};
