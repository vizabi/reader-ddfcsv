"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('fetch-polyfill');
class FrontendFileReader {
    setRecordTransformer(recordTransformer) {
        this.recordTransformer = recordTransformer;
    }
    readText(filePath, onFileRead) {
        fetch(filePath)
            .then(response => response.text())
            .then(text => {
            onFileRead(null, text);
        })
            .catch(err => {
            onFileRead(`${filePath} read error: ${err}`);
        });
    }
}
exports.FrontendFileReader = FrontendFileReader;
//# sourceMappingURL=frontend-file-reader.js.map