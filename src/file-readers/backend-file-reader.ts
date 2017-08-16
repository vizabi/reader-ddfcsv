import * as fs from 'fs';
import * as csvParse from 'csv-parse';
import { compact, head, split } from 'lodash';
import { IReader } from './reader';

export class BackendFileReader implements IReader {
  public recordTransformer: Function;

  setRecordTransformer(recordTransformer) {
    this.recordTransformer = recordTransformer;
  }

  readCSV(filePath, onFileRead) {
    const fileStream = fs.createReadStream(filePath, {encoding: 'utf8'});

    fileStream.on('error', onFileRead);

    const parser = csvParse({columns: true}, (err, contentSource) => {
      if (err) {
        onFileRead(err);
        return;
      }

      let content = null;

      if (this.recordTransformer) {
        content = compact(contentSource.map(record => this.recordTransformer(record, filePath)));
      }

      if (!this.recordTransformer) {
        content = contentSource;
      }

      onFileRead(err, content);
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

  readText(filePath, onFileRead) {
    fs.readFile(filePath, (err, content) => {
      if (err) {
        onFileRead(err);
        return;
      }

      onFileRead(null, content.toString());
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
