/* eslint-disable */

import cloneDeep from 'lodash/cloneDeep';
import {FrontendFileReader} from './file-utils';
import {Ddf} from './ddf';
import {getShapes} from './shapes';

const Promise = require('es6-promise').Promise;

export default function getDDFCsvReaderObject(externalFileReader, logger) {
  return {
    init(reader_info) {
      var fileReader = externalFileReader || new FrontendFileReader();

      this._data = [];
      this._ddfPath = reader_info.path;
      this.ddf = new Ddf(this._ddfPath, fileReader);
    },

    read(queryPar) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var query = cloneDeep(queryPar);

        function isShapeQuery() {
          return queryPar.select.indexOf('shape_lores_svg') >= 0 && queryPar.where['geo.cat'].length > 0;
        }

        if (isShapeQuery()) {
          _this._data = getShapes(queryPar.where['geo.cat']);
          if (logger && logger.log) {
            logger.log('shapes from reader', JSON.stringify(queryPar), JSON.stringify(_this._data));
          }
          resolve();
        }

        if (!isShapeQuery()) {
          _this.ddf.getIndex(function () {
            // get `concepts` and `entities` in any case
            // this data needed for query's kind (service, data point) detection
            _this.ddf.getConceptsAndEntities(query, function (err, concepts, entities) {
              if (err) {
                reject(err);
              }

              // service query: it was detected by next criteria:
              // all of `select` section of query parts are NOT measures
              if (!err && _this.ddf.divideConceptsFromQueryByType(query).measures.length <= 0) {
                _this._data = entities;
                if (logger && logger.log) {
                  logger.log(JSON.stringify(queryPar), JSON.stringify(_this._data));
                }

                resolve();
              }

              // data point query: it was detected by next criteria:
              // at least one measure was detected in `select` section of the query
              if (_this.ddf.divideConceptsFromQueryByType(query).measures.length > 0) {
                _this.ddf.getDataPoints(query, function (err, data) {
                  if (err) {
                    reject(err);
                  }

                  if (!err) {
                    _this._data = data;
                    if (logger && logger.log) {
                      logger.log(JSON.stringify(queryPar), JSON.stringify(_this._data));
                    }

                    resolve();
                  }
                });
              }
            });
          });
        }
      });
    },

    getData() {
      return this._data;
    }
  };
};
