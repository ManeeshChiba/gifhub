const path = require('path');
const sass = require('node-sass');

const sourceFiles = path.resolve(__dirname, '../src');
const outputFiles = path.resolve(__dirname, '../dist');

module.exports = async () => {
  return new Promise((res, rej) => {
    // Get all scss files here

    const renderer = sass.render({
      file: `${sourceFiles}/test.scss`,
      includePaths: ['lib/', 'mod/'],
      outputStyle: 'compressed'
    }, function (error, result) { // node-style callback from v3.0.0 onwards
      if (error) {
        rej(`Problem with scss file: test.scss\n${error}`);
      }
      else {
        console.log(result.css.toString());
      }
    });

    renderer.then(() => res('done!'));
  });
};