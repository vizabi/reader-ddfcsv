const path = require('path');
const fs = require('fs');

try {
    if (!process.env.npm_package_version || !process.env.npm_package_name) {
        console.log(`process.env.npm_package_version or process.env.npm_package_name are not defined!`);
        process.exit(1);
    }

    const fileName = path.resolve('..', 'lib', 'src', 'ddfcsv-reader.js');
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
