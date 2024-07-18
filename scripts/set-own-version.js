const path = require('path');
const fs = require('fs');
const meta = require('../package.json');

try {
    if (!process.env.npm_package_version || !process.env.npm_package_name) {
        console.log(`process.env.npm_package_version or process.env.npm_package_name are not defined!`);
        process.exit(1);
    }

    const fileName = path.resolve('..', process.env.TARGET_DIR, 'src', 'ddfcsv-reader.js');
    const content = fs.readFileSync(fileName, 'utf-8');
    const oldVersionContent = /const myVersion = '';/;
    const newVersionContent = `const myVersion = '${process.env.npm_package_version}';`;
    const oldNameContent = /const myName = '';/;
    const newNameContent = `const myName = '${process.env.npm_package_name}';`;
    const newContent = content.replace(oldVersionContent, newVersionContent).replace(oldNameContent, newNameContent);
    fs.writeFileSync(fileName, newContent);
} catch (e) {
    console.log(e);
    process.exit(1);
}

try {
    const fileName = path.resolve('..', process.env.TARGET_DIR, 'src', `index${process.env.TARGET_DIR.slice(3)}.js`);
    const content = fs.readFileSync(fileName, 'utf-8');
    const oldVersionContent = /const __VERSION = '';/;
    const newVersionContent = `const __VERSION = '${meta.version}';`;
    const oldBuildContent = /const __BUILD = '';/;
    const newBuildContent = `const __BUILD = '${+(new Date())}';`;
    const oldFieldsContent = /const __PACKAGE_JSON_FIELDS = '';/;
    const newFieldsContent = `const __PACKAGE_JSON_FIELDS = ${JSON.stringify({
        homepage: meta.homepage,
        name: meta.name,
        description: meta.description
    })};`;
    const newContent = content.replace(oldVersionContent, newVersionContent)
        .replace(oldBuildContent, newBuildContent)
        .replace(oldFieldsContent, newFieldsContent);
    fs.writeFileSync(fileName, newContent);
} catch (e) {
    console.log(e);
    process.exit(1);
}
