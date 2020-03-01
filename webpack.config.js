const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const isDevelopment = true;

module.exports = {
  devtool: 'source-map',
  entry: './src/index.js',
  output: {
    filename: 'vialch.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: "/VisualAlchemist/dist/",
  },
  module: {
	  rules: [
		  {
			  test: /\.css$/,
			  use: [
				  'style-loader',
				  'css-loader',
			  ],
		  },
		  {
			  test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
			  use: [
				  'file-loader',
			  ],
		  },
		  {
			  test: /\.(png|svg|jpg|gif)$/,
			  use: [
				  'file-loader',
			  ],
		  },
		  {
			  test: /\.s[a|c]ss$/,
	          use: [
	        	  isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
    	          {
    	            loader: 'css-loader',
    	            options: {
    	            }
    	          },
    	          { loader: 'sass-loader',
    	              options: {
    	                  sourceMap: true,
    	                  sassOptions: {
        	                  indentedSyntax: false,
    	                  }
    	              }
    	          }
	          ],
		  },
	  ],
  },
 plugins: [
	    new webpack.ProvidePlugin({
	    	Popper: 'popper.js',
	    	moment: 'moment',
	    }),
	    
	    new MiniCssExtractPlugin({
	    	filename: '[name].css',
	    })
 ],  
};