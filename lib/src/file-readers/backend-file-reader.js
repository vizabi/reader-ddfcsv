"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
class BackendFileReader {
    setRecordTransformer(recordTransformer) {
        this.recordTransformer = recordTransformer;
    }
    readText(filePath, onFileRead) {
        if (!fs.existsSync(filePath)) {
            return onFileRead('No such file: ' + filePath);
        }
        fs.readFile(filePath, 'utf-8', (err, content) => {
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