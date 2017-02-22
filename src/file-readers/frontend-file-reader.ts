import {compact} from 'lodash';
import * as csvParse from 'csv-parse';
import {IReader} from './reader';

require('fetch-polyfill');

declare var fetch;

export class FrontendFileReader implements IReader {
  public recordTransformer: Function;

  setRecordTransformer(recordTransformer) {
    this.recordTransformer = recordTransformer;
  }

  readCSV(filePath, onFileRead) {
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
            content = compact(content.map(record => this.recordTransformer(record, filePath)));
          }

          onFileRead(null, content);
        });
      })
      .catch(err => {
        onFileRead(err || `${filePath} read error`);
      });
  }

  readJSON(filePath, onFileRead) {
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

  getFileSchema(filePath, onFileRead) {
  }
}
