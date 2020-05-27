const chalk = require('chalk');
const makeChromiumManifest = require('./make-chromium-manifest');
const makeStyles = require('./make-styles');

const makeChromium = () => {
  const mainfest = makeChromiumManifest();
  const styles = makeStyles();
  
  Promise.all([mainfest, styles]).then((resolutions) => {
    console.log(resolutions[0]);
  });
}

makeChromium();