import * as isNil from 'lodash.isnil';
import * as isObject from 'lodash.isobject';
import { ddfCsvReader } from './ddf-csv';
import { IReader } from './interfaces';
import { getRepositoryPath } from 'ddf-query-validator';

export function prepareDDFCsvReaderObject (defaultFileReader?: IReader) {
  return function(externalFileReader?: IReader, logger?: any) {
    return {
      init (readerInfo) {
        // TODO: check validity of base path
        this._basePath = readerInfo.path;

        this._lastModified = readerInfo._lastModified;
        this.fileReader = externalFileReader || defaultFileReader;
        this.logger = logger;
        this.resultTransformer = readerInfo.resultTransformer;

        this.readerOptions = {
          basePath: this._basePath,
          fileReader: this.fileReader,
          logger: this.logger,
        };

        this.reader = ddfCsvReader(this.logger);
      },

      async getAsset (asset) {
        const isJsonAsset = asset.slice(-'.json'.length) === '.json';
        const assetPath = `${this._basePath}/${asset}`;

        return new Promise((resolve, reject) => {
          this.fileReader.readText(assetPath, (err, data) => {
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

      async read (queryParam, parsers) {
        let result;

        try {
          result = await this.reader.query(queryParam, {
            basePath: this._basePath,
            fileReader: this.fileReader,
            logger: this.logger,
            conceptsLookup: new Map<string, any>()
          });
          result = parsers ? this._prettifyData(result, parsers) : result;

          if (this.resultTransformer) {
            result = this.resultTransformer(result);
          }

          if (this.logger && this.logger.log) {
            logger.log(JSON.stringify(queryParam), result.length);
            logger.log(result);
          }

        } catch (error) {
          throw error;
        }

        return result;
      },

      _prettifyData (data, parsers) {
        return data.map(record => {
          const keys = Object.keys(record);

          keys.forEach(key => {
            if (parsers[ key ]) {
              record[ key ] = parsers[ key ](record[ key ]);
            }
          });

          return record;
        });
      }
    };
  };
}
