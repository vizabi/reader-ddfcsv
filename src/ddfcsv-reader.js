/* eslint-disable */

import cloneDeep from 'lodash/cloneDeep';
import {Ddf} from './ddf';
const Promise = require('bluebird');

export default function prepareDDFCsvReaderObject(defaultFileReader) {
  return function (externalFileReader, logger) {
    return {
      init(reader_info) {
        var fileReader = externalFileReader || defaultFileReader;

        this._ddfPath = reader_info.path;
        this.ddf = new Ddf(this._ddfPath, fileReader);
      },

      read(queryPar, parsers) {
        var _this = this;

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

        return new Promise(function (resolve, reject) {
          var query = cloneDeep(queryPar);

          _this.ddf.ddfRequest(query, function (err, data) {
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
