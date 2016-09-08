/* eslint-disable */

import cloneDeep from 'lodash/cloneDeep';
import {Ddf} from './ddf';
const Promise = require('bluebird');

export default function prepareDDFCsvReaderObject(defaultFileReader) {
  return function (externalFileReader, logger) {
    return {
      init(reader_info) {
        var fileReader = externalFileReader || defaultFileReader;

        this._data = [];
        this._ddfPath = reader_info.path;
        this._parsers = reader_info.parsers;
        this.ddf = new Ddf(this._ddfPath, fileReader);
      },

      read(queryPar) {
        var _this = this;

        function prettifyData(data) {
          return data.map(record => {
            const keys = Object.keys(record);

            keys.forEach(key => {
              if (_this._parsers[key]) {
                record[key] = _this._parsers[key](record[key]);
              }
            });

            return record;
          });
        }

        return new Promise(function (resolve, reject) {
          var query = cloneDeep(queryPar);

          _this.ddf.processRequest(query, function (err, data) {
            if (err) {
              reject(err);
              return;
            }

            _this._data = _this._parsers ? prettifyData(data) : data;

            if (logger && logger.log) {
              logger.log(JSON.stringify(queryPar), JSON.stringify(_this._data));
            }

            resolve();
          });
        });
      },

      getData() {
        return this._data;
      }
    };
  };
}
