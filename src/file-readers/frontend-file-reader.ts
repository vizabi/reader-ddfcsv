import { IResourceRead } from '../interfaces';

require('fetch-polyfill');

declare var fetch;

export class FrontendFileReader implements IResourceRead {
  public recordTransformer: Function;

  setRecordTransformer(recordTransformer) {
    this.recordTransformer = recordTransformer;
  }

  readText(filePath, onFileRead, options: object) {
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
