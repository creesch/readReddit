/* eslint-env node */
const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv;
const archiver = require('archiver');

const version = argv.new_version;

//
// Building constants
//
const extensionDir = path.resolve(__dirname, 'extension');
const manifestFile = path.resolve(extensionDir, 'manifest.json');
const buildOutputDir = path.resolve(__dirname, 'build');

// Update the manifest with new versions.
function updateManifest (version) {
    console.log('Updating manifest:');

    let manifestContent = fs.readFileSync(manifestFile).toString();

    if (version) {
        console.log(` - Version: ${version}`);
        manifestContent = manifestContent.replace(/("version.*?": ")\d\d?\.\d\d?\.\d\d?(:|")/g, `$1${version}$2`);
    } else {
        return;
    }

    fs.writeFileSync(manifestFile, manifestContent, 'utf8', err => {
        if (err) {
            throw err;
        }
    });
    console.log('Manifest has been updated with new information.\n');
}

function createZip () {
    return new Promise((resolve, reject) => {
        // Update the manifest first if needed.

        if (version) {
            updateManifest(version);
        }

        // Then pull up the toolbox version.
        const manifestContent = fs.readFileSync(manifestFile).toString();
        const readRedditVersion = manifestContent.match(/"version": "(\d\d?\.\d\d?\.\d\d?)"/)[1];

        // Determine what the output filename will be.
        const outputName = `readReddit_v${readRedditVersion}.zip`;
        const outputPath = path.resolve(buildOutputDir, outputName);

        // Check if the build directory is a thing and if it isn't make it
        try {
            fs.statSync(buildOutputDir);
        } catch (e) {
            fs.mkdirSync(buildOutputDir);
        }

        // Check for and delete excisting zip with the same name.
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }

        // Start zipping
        console.log(`Creating zip file for readReddit ${readRedditVersion}.`);
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
        archive.directory(extensionDir, false);

        archive.finalize();
    });
}

createZip();
