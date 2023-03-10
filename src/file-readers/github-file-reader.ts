/* tslint:disable */

// import * as https from 'https';

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

import { IResourceRead } from '../interfaces';

export class GithubFileReader implements IResourceRead {
  public recordTransformer: Function;

  setRecordTransformer(recordTransformer) {
    this.recordTransformer = recordTransformer;
  }

  readText(filePath, onFileRead, options: object) {
  }

  checkFile(path: string) {
  }
}
