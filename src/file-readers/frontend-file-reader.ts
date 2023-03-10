import { IResourceRead } from '../interfaces';

require('fetch-polyfill');

declare var fetch;

export class FrontendFileReader implements IResourceRead {
  public recordTransformer: Function;

  setRecordTransformer(recordTransformer) {
    this.recordTransformer = recordTransformer;
  }

  checkFile(path: string) {
    fetch(path, { method: "HEAD", credentials: 'same-origin', redirect: "follow"})
        .then((response) => {
          //the client should then look into response.ok, response.status and response.url 
          return Promise.resolve(response)
        });
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
