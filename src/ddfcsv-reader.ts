import {cloneDeep} from 'lodash';
import {Ddf} from './ddf';
import {IReader} from './file-readers/reader';
import * as Promise from 'bluebird';

export function prepareDDFCsvReaderObject(defaultFileReader?: IReader) {
  return function (externalFileReader?: IReader, logger?: any) {
    return {
      init(reader_info) {
        const fileReader = externalFileReader || defaultFileReader;

        this.ddf = new Ddf(reader_info.path, fileReader);
      },

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
          const query = cloneDeep(queryPar);

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
