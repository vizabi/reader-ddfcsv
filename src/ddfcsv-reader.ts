import * as isEmpty from 'lodash.isempty';
import { ddfCsvReader } from './ddf-csv';
import { IResourceRead } from './interfaces';
import { getRepositoryPath } from 'ddf-query-validator';
import { DdfCsvError } from './ddfcsv-error';
import { createDiagnosticManagerOn, EndpointDiagnosticManager, getLevelByLabel } from 'cross-project-diagnostics';
import { DiagnosticManager, Level } from 'cross-project-diagnostics/lib';

const myName = '';
const myVersion = '';

export function prepareDDFCsvReaderObject (defaultResourceReader?: IResourceRead) {
  return function(externalResourceReader?: IResourceRead, logger?: any) {
    return {
      init (readerInfo) {
        // TODO: check validity of base path
        this._basePath = readerInfo.path;

        this._lastModified = readerInfo._lastModified;
        this.fileReader = externalResourceReader || defaultResourceReader;
        this.logger = logger;
        this.resultTransformer = readerInfo.resultTransformer;

        this.readerOptions = {
          basePath: this._basePath,
          fileReader: this.fileReader,
          logger: this.logger,
        };

        this.reader = ddfCsvReader(this.logger);
      },

      async checkFile(path:string): Promise<any> {
        return new Promise((resolve, reject) => {
          const status = this.fileRrader.checkFile(path);
          return resolve({status, url: path});
        });
      },

      async getFile (filePath: string, isJsonFile: boolean, options: object): Promise<any> {
        return new Promise((resolve, reject) => {
          this.fileReader.readText(filePath, (err, data) => {
            if (err) {
              return reject(err);
            }

            try {
              if (isJsonFile) {
                return resolve(JSON.parse(data));
              }

              return resolve(data);
            } catch (jsonErr) {
              return reject(jsonErr);
            }
          }, options);
        });
      },


      async checkIfAssetExists (filePath: string, repositoryPath: string = ''): Promise<any> {
        if (isEmpty(repositoryPath) && isEmpty(this._basePath)) {
          throw new DdfCsvError(`Neither initial 'path' nor 'repositoryPath' as a second param were found.`, `Happens in 'checkIfAssetExists' function`, filePath);
        }

        const assetPath = `${repositoryPath || this._basePath}/assets/${filePath}`;

        return await this.checkFile(assetPath);
      },

      async getAsset (filePath: string, repositoryPath: string = ''): Promise<any> {
        if (isEmpty(repositoryPath) && isEmpty(this._basePath)) {
          throw new DdfCsvError(`Neither initial 'path' nor 'repositoryPath' as a second param were found.`, `Happens in 'getAsset' function`, filePath);
        }

        const assetPath = `${repositoryPath || this._basePath}/${filePath}`;
        const isJsonAsset = (assetPath).slice(-'.json'.length) === '.json';

        return await this.getFile(assetPath, isJsonAsset);
      },

      async read (queryParam, parsers, parentDiagnostic?: DiagnosticManager) {
        const diagnostic = parentDiagnostic ?
          createDiagnosticManagerOn(myName, myVersion).basedOn(parentDiagnostic) :
          createDiagnosticManagerOn(myName, myVersion).forRequest('').withSeverityLevel(Level.OFF);
        const { debug, error, fatal } = diagnostic.prepareDiagnosticFor('read');

        let result;

        debug('start reading', queryParam);

        try {
          if (isEmpty(queryParam.repositoryPath) && isEmpty(this._basePath)) {
            const message = `Neither initial 'path' nor 'repositoryPath' in query were found.`;
            const err = new DdfCsvError(message, JSON.stringify(queryParam));
            error(message, err);
            throw err;
          }

          result = await this.reader.query(queryParam, {
            basePath: queryParam.repositoryPath || this._basePath,
            fileReader: this.fileReader,
            logger: this.logger,
            conceptsLookup: new Map<string, any>(),
            diagnostic
          });
          result = parsers ? this._prettifyData(result, parsers) : result;

          if (this.resultTransformer) {
            result = this.resultTransformer(result);
          }

          if (this.logger && this.logger.log) {
            logger.log(JSON.stringify(queryParam), result.length);
            logger.log(result);
          }
        } catch (err) {
          fatal('global data reading error', err);
          throw err;
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
