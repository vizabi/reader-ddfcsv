import {compact} from 'lodash';
import * as csvParse from 'papaparse';
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
        const {errors, data} = csvParse.parse(text, {
          header: true,
          skipEmptyLines: true
        });

        if (errors.length) {
          onFileRead(errors);
          return;
        }

        let content = data;

        if (this.recordTransformer) {
          content = compact(content.map(record => this.recordTransformer(record)));
        }

        onFileRead(null, content);
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
