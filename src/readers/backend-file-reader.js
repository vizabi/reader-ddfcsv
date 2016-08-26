import fs from 'fs';
import csvParse from 'csv-parse';

export class BackendFileReader {
  constructor() {
    this.cache = {};
  }

  setRecordTransformer(recordTransformer) {
    this.recordTransformer = recordTransformer;
  }

  read(filePath, onFileRead, isCacheNeeded = true) {
    const fileStream = fs.createReadStream(filePath);
    const parser = csvParse({columns: true}, (err, contentSource) => {
      const content =
        this.recordTransformer ? contentSource.map(record => this.recordTransformer(record)) : contentSource;

      if (isCacheNeeded) {
        this.cache[filePath] = content;
      }

      onFileRead(err, content);
    });

    fileStream.pipe(parser);
  }
}
