import * as https from 'https';
import * as csvParse from 'csv-parse';
import { compact, head, split } from 'lodash';
import { IReader } from './reader';

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

export class GithubFileReader implements IReader {
  public recordTransformer: Function;

  setRecordTransformer(recordTransformer) {
    this.recordTransformer = recordTransformer;
  }

  readCSV(filePath, onFileRead) {
    readViaHttp(filePath, (contentError, content) => {
      if (contentError) {
        onFileRead(contentError);
        return;
      }

      csvParse(content, {columns: true}, (err, contentSource) => {
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
    });
  }

  readJSON(filePath, onFileRead) {
    readViaHttp(filePath, (contentError, content) => {
      if (contentError) {
        onFileRead(contentError);
        return;
      }

      try {
        onFileRead(null, JSON.parse(content));
      } catch (jsonErr) {
        onFileRead(jsonErr);
      }
    });
  }

  readText(filePath, onFileRead) {
  }

  getFileSchema(filePath, onFileRead) {
    readViaHttp(filePath, (contentError, content) => {
      if (contentError) {
        onFileRead(contentError);
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
