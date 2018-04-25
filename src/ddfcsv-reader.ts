import * as Promise from 'bluebird';
import { ddfCsvReader } from './ddf-csv';
import { IReader } from './file-readers/reader';

export function prepareDDFCsvReaderObject(defaultFileReader?: IReader) {
  return function (externalFileReader?: IReader, logger?: any) {
    return {
      init(readerInfo) {
        this._basepath = readerInfo.path;
        this._lastModified = readerInfo._lastModified;
        this.fileReader = externalFileReader || defaultFileReader;
        this.logger = logger;
        this.resultTransformer = readerInfo.resultTransformer;
        this.reader = ddfCsvReader(`${this._basepath}/datapackage.json`, this.fileReader, this.logger);
      },

      getAsset(asset) {
        const isJsonAsset = asset.slice(-'.json'.length) === '.json';

        return new Promise((resolve, reject) => {
          this.fileReader.readText(`${this._basepath}/${asset}`, (err, data) => {
            if (err) {
              reject(err);
              return;
            }

            if (isJsonAsset) {
              try {
                resolve(JSON.parse(data));
              } catch (jsonErr) {
                reject(err);
              }
            } else {
              resolve(data);
            }
          });
        });
      },

      // create own custom parser from WS!!!
      // no,,, create ability to use custom transformer for data
      // try empty query!!! -> headers
      read(queryPar, parsers) {
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
          this.reader.query(queryPar).then(result => {
            result = parsers ? prettifyData(result) : result;

            if (this.resultTransformer) {
              result = this.resultTransformer(result);
            }

            if (this.logger && this.logger.log) {
              logger.log(JSON.stringify(queryPar), result.length);
              logger.log(result);
            }

            resolve(result);
          }).catch(err => {
            reject(err);
          });
        });
      }
    };
  };
}
