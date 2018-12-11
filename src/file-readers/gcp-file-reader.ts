import { IReader } from '../interfaces';
import { Storage, Bucket } from '@google-cloud/storage';

const storageConfig = {
  projectId: process.env.GCP_PROJECT_ID || 'GCP_PROJECT_ID',
  keyFilename: process.env.PATH_TO_GCP_SERVICE_ACCOUNT_FILE || 'PATH_TO_GCP_SERVICE_ACCOUNT_FILE'
};
const bucketName = process.env.GCP_STORAGE_BUCKET_NAME || 'GCP_STORAGE_BUCKET_NAME';

export class GcpFileReader implements IReader {
  public recordTransformer: Function;

  private storage: Storage;
  private bucket: Bucket;

  constructor() {
    this.storage = new Storage(storageConfig);
    this.bucket = this.storage.bucket(bucketName);
  }

  setRecordTransformer(recordTransformer) {
    this.recordTransformer = recordTransformer;
  }

  readText(filePath, onFileRead, options: object = {}) {
    const remoteFile = this.bucket.file(filePath);

    let fileContents = new Buffer('');

    remoteFile.createReadStream()
      .on('data', chunk => {
        fileContents = Buffer.concat([fileContents, chunk]);
      })
      .on('error', error => {
        onFileRead(`[${filePath}]: ${error.stack}`);
      })
      .on('end', () => {
        onFileRead(null, fileContents.toString('utf8'));
      });
  }
}
