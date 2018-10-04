import { IReader } from '../interfaces';
import * as S3 from 'aws-sdk/clients/s3';
import { AWSError } from 'aws-sdk/lib/error';

const auth = {
  apiVersion: '2006-03-01',
  secretAccessKey: process.env.S3_SECRET_KEY,
  accessKeyId: process.env.S3_ACCESS_KEY,
  logger: process.stdout
};

const s3 = new S3(auth);

export class S3FileReader implements IReader {
  public recordTransformer: Function;

  setRecordTransformer(recordTransformer) {
    this.recordTransformer = recordTransformer;
  }

  readText(filePath, onFileRead, options: object = {}) {
    const params = Object.assign({
      Key: filePath,
      Bucket: process.env.S3_BUCKET
    }, options);

    s3.getObject(params, function(error: AWSError, data: S3.Types.GetObjectOutput) {
      if (error) {
        return onFileRead(`[${filePath}] ${JSON.stringify(params)}: ${error.stack}`);
      }
      return onFileRead(null, data.Body.toString());
    });
  }
}
