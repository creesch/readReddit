'use strict';
/* eslint-env node */
const fs = require('fs-extra');
const path = require('path');
const argv = require('yargs').argv;
const archiver = require('archiver');

const version = argv.new_version;

//
// Building constants
//
const extensionDir = path.resolve(__dirname, 'extension');
const extensionDataDir = path.resolve(extensionDir, 'data');
const buildOutputDir = path.resolve(__dirname, 'build');

const manifestDetails = [
    {
        browser: 'firefox',
        manifestPath: path.resolve(extensionDir, 'manifest_firefox.json'),
    },
    {
        browser: 'chrome',
        manifestPath: path.resolve(extensionDir, 'manifest_chrome.json'),
    },
];

// Check if the build directory is a thing and if it isn't make it
try {
    fs.statSync(buildOutputDir);
} catch (e) {
    fs.mkdirSync(buildOutputDir);
}

// Update the manifest with new versions.
function copyFiles (manifestDetail, version) {
    console.log(`Copying manifest: ${manifestDetail.browser}`);

    let manifestContent = fs.readFileSync(manifestDetail.manifestPath).toString();
    let readRedditVersion;
    const browserOutputDir = path.resolve(buildOutputDir, manifestDetail.browser);
    const browserOutputDataDir = path.resolve(browserOutputDir, 'data');
    const browserManifestPath = path.resolve(browserOutputDir, 'manifest.json');
    // Check if the  browser output directory is a thing and if it isn't make it
    try {
        fs.statSync(browserOutputDir);
        // Empty the current directory
        fs.rmSync(browserOutputDir, {
            recursive: true,
        });
    } catch (e) {
        fs.mkdirSync(browserOutputDir);
    }

    // copy over data dir to browser output dir.
    fs.copySync(extensionDataDir, browserOutputDataDir);

    if (version) {
        console.log('Updating manifest:');
        console.log(` - Version: ${version}`);
        manifestContent = manifestContent.replace(/("version.*?": ")\d\d?\.\d\d?\.\d\d?(:|")/g, `$1${version}$2`);
        console.log('Manifest has been updated with new information.\n');
        readRedditVersion = version;

        // Write back origional
        fs.writeFileSync(manifestDetail.manifestPath, manifestContent, 'utf8', err => {
            if (err) {
                throw err;
            }
        });
    } else {
        readRedditVersion = manifestContent.match(/"version": "(\d\d?\.\d\d?\.\d\d?)"/)[1];
    }

    // Write to output dir.
    fs.writeFileSync(browserManifestPath, manifestContent, 'utf8', err => {
        if (err) {
            throw err;
        }
    });
    console.log(`Manifest for ${manifestDetail.browser} has been copied\n `);

    return {
        readRedditVersion,
        browserOutputDir,
    };
}

function createZip (manifestDetail) {
    return new Promise((resolve, reject) => {
        // Copy the browser specific manifest
        // Update the manifest first if needed.
        const outputDetails = copyFiles(manifestDetail, version);

        // Determine what the output filename will be.
        const outputName = `readReddit_v${outputDetails.readRedditVersion}_${manifestDetail.browser}.zip`;
        const outputPath = path.resolve(buildOutputDir, outputName);

        // Check for and delete excisting zip with the same name.
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }

        // Start zipping
        console.log(`Creating zip file for readReddit ${outputDetails.readRedditVersion} ${manifestDetail.browser}.`);
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip');

        output.on('close', () => {
            setTimeout(() => {
                console.log(`Zip created: ${archive.pointer()} total bytes`);
                console.log('Build done.', new Date().toISOString());
                resolve();
            }, 200);
        });

        archive.on('error', err => {
            reject(err);
        });

        archive.pipe(output);
        archive.directory(outputDetails.browserOutputDir, false);

        archive.finalize();
    });
}

manifestDetails.forEach(manifestDetail => {
    createZip(manifestDetail);
});

