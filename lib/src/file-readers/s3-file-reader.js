"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const S3 = require("aws-sdk/clients/s3");
const auth = {
    apiVersion: '2006-03-01',
    secretAccessKey: process.env.S3_SECRET_KEY,
    accessKeyId: process.env.S3_ACCESS_KEY,
    logger: process.stdout
};
const s3 = new S3(auth);
class S3FileReader {
    setRecordTransformer(recordTransformer) {
        this.recordTransformer = recordTransformer;
    }
    readText(filePath, onFileRead) {
        const params = {
            Key: filePath,
            Bucket: process.env.S3_BUCKET
        };
        s3.getObject(params, function (error, data) {
            if (error) {
                return onFileRead(`[${filePath}] ${JSON.stringify(params)}: ${error.stack}`);
            }
            return onFileRead(null, data.Body.toString());
        });
    }
}
exports.S3FileReader = S3FileReader;
//# sourceMappingURL=s3-file-reader.js.map