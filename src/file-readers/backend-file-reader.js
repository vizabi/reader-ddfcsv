import fs from 'fs';
import csvParse from 'csv-parse';
import compact from 'lodash/compact';
import head from 'lodash/head';
import split from 'lodash/split';

const cache = {};

export class BackendFileReader {
  setRecordTransformer(recordTransformer) {
    this.recordTransformer = recordTransformer;
  }

  readCSV(filePath, onFileRead) {
    if (cache[filePath]) {
      onFileRead(null, cache[filePath]);
      return;
    }

    const fileStream = fs.createReadStream(filePath, {encoding: 'utf8'});
    const parser = csvParse({columns: true}, (err, contentSource) => {
      let content = null;

      if (this.recordTransformer) {
        content = compact(contentSource.map(record => this.recordTransformer(record)));
      }

      if (!this.recordTransformer) {
        content = contentSource;
      }

      cache[filePath] = content;

      onFileRead(err, cache[filePath]);
    });

    fileStream.pipe(parser);
  }

  readJSON(filePath, onFileRead) {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        onFileRead(err);
        return;
      }

      try {
        onFileRead(null, JSON.parse(data));
      } catch (jsonErr) {
        onFileRead(jsonErr);
      }
    });
  }

  getFileSchema(filePath, onFileRead) {
    fs.readFile(filePath, (err, content) => {
      if (err) {
        onFileRead(err);
        return;
      }

      const arrayContent = split(content.toString(), '\n');
      const firstRecord = head(arrayContent);
      const header = split(firstRecord, ',');
      const recordCount = arrayContent.length - 1;

      onFileRead(null, {filePath, header, recordCount});
    });
  }
}
