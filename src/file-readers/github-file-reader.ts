/* tslint:disable */

// import * as https from 'https';
import { IReader } from './reader';

/*
function readViaHttp(filePath: string, onFileRead: Function) {
  let content: string = '';

  https.get(filePath, res => {
    res.on('data', chunk => {
      content += chunk;
    });
    res.on('end', () => {
      onFileRead(null, content);
    });
  }).on('error', error => {
    onFileRead(error);
  });
}
*/

export class GithubFileReader implements IReader {
  public recordTransformer: Function;

  setRecordTransformer(recordTransformer) {
    this.recordTransformer = recordTransformer;
  }

  readText(filePath, onFileRead) {
  }
}
