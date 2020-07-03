const { readFile, writeFile } = require('fs');
const path = require('path');
const root = path.join(__dirname, `..`);
const pckage = require(`${root}/package.json`);
const chalk = require('chalk');

const sourceFiles = path.resolve(__dirname, '../src');
const outputFiles = path.resolve(__dirname, '../dist');

/**
 * Creates a manifest.json for chromium based browsers
 */
module.exports = async () => {
  return new Promise((res, rej) => {
    // Read the template
    readFile(`${sourceFiles}/manifest.json`, (error, data) => processManifest(error, data));

    // Process manifest for any chrome specific changes
    processManifest = (error, data) => {
      if (error) {
        rej(`Problem with template file: ${error}`);
        throw new Error(`Problem with template file: ${error}`);
      }

      const srcManifest = JSON.parse(data);

      // Manifest version should match package
      srcManifest.version = pckage.version;

      const modifiedManifest = JSON.stringify(srcManifest);

      writeFile(`${outputFiles}/manifest.json`, modifiedManifest, 'utf8', () => {
        res(`${chalk.green('✓')} manifest.json created for chromium`);
      });
    };
  });
};
