import * as fs from 'fs';
import { IResourceRead } from '../interfaces';
import * as path from 'path';

export class BackendFileReader implements IResourceRead {
  public recordTransformer: Function;

  setRecordTransformer(recordTransformer) {
    this.recordTransformer = recordTransformer;
  }

  readText(filePath, onFileRead, options: object) {
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
