import { IReader } from './reader';

require('fetch-polyfill');

declare var fetch;

export class FrontendFileReader implements IReader {
  public recordTransformer: Function;

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
        onFileRead(err || `${filePath} read error`);
      });
  }
}
