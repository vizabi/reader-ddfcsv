import compact from 'lodash/compact';

const csvParse = require('csv-parse');

require('fetch-polyfill');

const cache = {};

/* eslint-disable no-undef */
export class FrontendFileReader {
  setRecordTransformer(recordTransformer) {
    this.recordTransformer = recordTransformer;
  }

  readCSV(filePath, onFileRead) {
    if (cache[filePath]) {
      onFileRead(null, cache[filePath]);
      return;
    }

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
            content = compact(content.map(record => this.recordTransformer(record)));
          }

          cache[filePath] = content;

          onFileRead(null, cache[filePath]);
        });
      })
      .catch(err => {
        onFileRead(err || `${filePath} read error`);
      });
  }

  readJSON(filePath, onFileRead) {
    if (cache[filePath]) {
      onFileRead(null, cache[filePath]);
      return;
    }

    fetch(filePath)
      .then(response => response.text())
      .then(text => {
        try {
          onFileRead(null, JSON.parse(text));
        } catch (jsonError) {
          onFileRead(jsonError);
        }
      })
      .catch(err => {
        onFileRead(err || `${filePath} read error`);
      });
  }
}
