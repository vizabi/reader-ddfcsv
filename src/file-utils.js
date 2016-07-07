import {createReadStream} from 'fs';
import parse from 'csv-parse';
import parseSync from 'csv-parse/lib/sync';

const HTTP_STATUS_OK = 200;
const EXPECTED_READY_STATE = 4;

/* eslint-disable no-undef */
export class FrontendFileReader {
  constructor() {
    this.cache = {};
  }

  read(filePath, onFileRead) {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', filePath);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === EXPECTED_READY_STATE) {
        if (xhr.status !== HTTP_STATUS_OK) {
          onFileRead(xhr.status);
          return;
        }

        this.cache[filePath] = parseSync(xhr.responseText, {columns: true});

        onFileRead(null, this.cache[filePath]);
      }
    };
    xhr.onerror = () => onFileRead(xhr.status);
    xhr.send();
  }
}

/* eslint-enable no-undef */

export class BackendFileReader {
  constructor() {
    this.cache = {};
  }

  read(filePath, onFileRead) {
    const fileStream = createReadStream(filePath);
    const parser = parse({columns: true}, (err, content) => {
      this.cache[filePath] = content;

      onFileRead(err, content);
    });

    fileStream.pipe(parser);
  }
}

export class ChromeFileReader {
  constructor(chromeFs) {
    this.chromeFs = chromeFs;
    this.cache = {};
  }

  read(filePath, onFileRead) {
    this.chromeFs.filePath(filePath, '', (err, csvContent) => {
      if (err) {
        onFileRead(err);
        return;
      }

      this.cache[filePath] = parseSync(csvContent, {columns: true});

      onFileRead(null, this.cache[filePath]);
    });
  }
}
