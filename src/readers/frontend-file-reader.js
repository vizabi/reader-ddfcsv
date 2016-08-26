const csvParse = require('csv-parse');

require('fetch-polyfill');

/* eslint-disable no-undef */
export class FrontendFileReader {
  constructor() {
    this.cache = {};
  }

  setRecordTransformer(recordTransformer) {
    this.recordTransformer = recordTransformer;
  }

  read(filePath, onFileRead, isCacheNeeded = true) {
    fetch(filePath)
      .then(response => response.text())
      .then(text => {
        csvParse(text, {columns: true}, (err, json) => {
          if (err) {
            onFileRead(err);
            return;
          }

          let content = json;

          if (this.recordTransformer) {
            content = content.map(record => this.recordTransformer(record));
          }

          if (isCacheNeeded) {
            this.cache[filePath] = content;
          }

          onFileRead(null, content);
        });
      })
      .catch(err => {
        onFileRead(err || `${filePath} read error`);
      });
  }
}
