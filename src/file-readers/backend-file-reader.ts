import * as fs from 'fs';
import { IReader } from './reader';

export class BackendFileReader implements IReader {
  public recordTransformer: Function;

  setRecordTransformer(recordTransformer) {
    this.recordTransformer = recordTransformer;
  }

  readText(filePath, onFileRead) {
    fs.readFile(filePath, 'utf-8', (err, content) => {
      if (err) {
        onFileRead(err);
        return;
      }

      onFileRead(null, content.toString());
    });
  }
}
