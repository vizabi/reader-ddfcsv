import * as fs from 'fs';
import { IReader } from '../interfaces';
import * as path from 'path';

export class BackendFileReader implements IReader {
  public recordTransformer: Function;

  setRecordTransformer(recordTransformer) {
    this.recordTransformer = recordTransformer;
  }

  readText(filePath, onFileRead) {
    if (!fs.existsSync(filePath)) {
      return onFileRead('No such file: ' + filePath);
    }

    fs.readFile(path.resolve(filePath), 'utf-8', (err, content) => {
      if (err) {
        onFileRead(err);
        return;
      }

      onFileRead(null, content.toString());
    });
  }
}
