import fs from 'fs';
import csvParse from 'csv-parse';
import compact from 'lodash/compact';

const cache = {};

export class BackendFileReader {
  setRecordTransformer(recordTransformer) {
    this.recordTransformer = recordTransformer;
  }

  read(filePath, onFileRead) {
    if (cache[filePath]) {
      onFileRead(null, cache[filePath]);
      return;
    }

    const fileStream = fs.createReadStream(filePath);
    const parser = csvParse({columns: true}, (err, contentSource) => {
      let content = null;

      if (this.recordTransformer) {
        content = compact(
          contentSource
            .map(record => this.recordTransformer(record))
        );
      }

      if (!this.recordTransformer) {
        content = contentSource;
      }

      cache[filePath] = content;

      onFileRead(err, cache[filePath]);
    });

    fileStream.pipe(parser);
  }
}
