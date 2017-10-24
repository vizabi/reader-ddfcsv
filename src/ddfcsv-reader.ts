import { cloneDeep, trimEnd, trimStart, endsWith } from 'lodash';
import { Ddf } from './ddf';
import { IReader } from './file-readers/reader';
import * as Promise from 'bluebird';

export function prepareDDFCsvReaderObject(defaultFileReader?: IReader) {
  return function (externalFileReader?: IReader, logger?: any) {
    return {
      init(readerInfo) {
        this._basepath = readerInfo.path;
        this._lastModified = readerInfo._lastModified;

        const fileReader = externalFileReader || defaultFileReader;

        this.ddf = new Ddf(readerInfo.path, fileReader);
      },

      getAsset(asset, options: any = {}) {
        const trimmedDdfPath = trimEnd(this.ddf.ddfPath, '/');
        const trimmedAsset = trimStart(asset, '/');
        const isJsonAsset = endsWith(trimmedAsset, '.json');

        return new Promise((resolve, reject) => {
          this.ddf.getAsset(`${trimmedDdfPath}/${trimmedAsset}`, isJsonAsset, (err, data) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(data);
          });
        });
      },

      read(queryPar, parsers) {
        const query = cloneDeep(queryPar);

        function prettifyData(data) {
          return data.map(record => {
            const keys = Object.keys(record);

            keys.forEach(key => {
              if (parsers[key]) {
                record[key] = parsers[key](record[key]);
              }
            });

            return record;
          });
        }

        return new Promise((resolve, reject) => {
          this.ddf.ddfRequest(query, function (err, data) {
            if (err) {
              reject(err);
              return;
            }

            data = parsers ? prettifyData(data) : data;

            if (logger && logger.log) {
              logger.log(JSON.stringify(queryPar), data.length, data);
            }

            resolve(data);
          });
        });
      }
    };
  };
}
