"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
class BackendFileReader {
    setRecordTransformer(recordTransformer) {
        this.recordTransformer = recordTransformer;
    }
    readText(filePath, onFileRead, options) {
        if (!fs.existsSync(filePath)) {
            return onFileRead('No such file: ' + filePath);
        }
        fs.readFile(path.resolve(filePath), 'utf-8', (err, content) => {
            if (err) {
                onFileRead(err);
                return;
            }
            onFileRead(null, content.toString());
        });
    }
}
exports.BackendFileReader = BackendFileReader;
//# sourceMappingURL=backend-file-reader.js.map