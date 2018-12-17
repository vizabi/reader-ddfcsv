import { IReader } from '../interfaces';
import { Storage, Bucket } from '@google-cloud/storage';

const storageConfig = {
  projectId: process.env.GCP_PROJECT_ID || 'GCP_PROJECT_ID'// ,
  // keyFilename: process.env.PATH_TO_GCP_SERVICE_ACCOUNT_FILE || 'PATH_TO_GCP_SERVICE_ACCOUNT_FILE'
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

    let fileContents = '';

    const readStream = remoteFile.createReadStream();

    readStream.setEncoding('utf8');

    readStream.on('data', chunk => {
      fileContents += chunk;
    });

    readStream.on('error', error => {
      onFileRead(`[${filePath}]: ${error.stack}`);
    });
    readStream.on('end', () => {
      onFileRead(null, fileContents);
    });
  }
}

/*
import * as https from 'https';
import { IReader } from '../interfaces';

export class GcpFileReader implements IReader {
  public recordTransformer: Function;

  setRecordTransformer(recordTransformer) {
    this.recordTransformer = recordTransformer;
  }

  readText(filePath, onFileRead, options: object) {
    const fullPath = `https://${process.env.GCP_STORAGE_BUCKET_NAME}.storage.googleapis.com/${filePath}`;

    https.get(fullPath, (resp) => {
      resp.setEncoding('utf8');

      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        onFileRead(null, data);
      });
    }).on('error', (err) => {
      onFileRead(`[${filePath}]: ${err.stack}`);
    });
  }
}
*/
