const path = require('path');

const sourceFiles = path.resolve(__dirname, 'src');
const outputFiles = path.resolve(__dirname, 'dist');

module.exports = () => {
  const entryFiles = {
    background: `${sourceFiles}/background.js`,
    content: `${sourceFiles}/content.js`,
  };

  return {
    mode: process.env.PRODUCTION ? 'production' : 'development',
    entry: {
      ...entryFiles
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: sourceFiles,
          loader: 'babel-loader',
          options: {
            compact: true,
          },
        },
      ]
    },
    output: {
      path: outputFiles,
      filename: '[name].min.js',
    }
  }
};