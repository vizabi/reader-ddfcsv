"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const isNil = require("lodash.isnil");
const isObject = require("lodash.isobject");
const ddf_csv_1 = require("./ddf-csv");
const ddf_query_validator_1 = require("ddf-query-validator");
function prepareDDFCsvReaderObject(defaultFileReader) {
    return function (externalFileReader, logger) {
        return {
            init(readerInfo) {
                this._basePath = readerInfo.path;
                this._lastModified = readerInfo._lastModified;
                this.fileReader = externalFileReader || defaultFileReader;
                this.logger = logger;
                this.resultTransformer = readerInfo.resultTransformer;
                this.datasetsConfig = readerInfo.datasetsConfig;
                this.isLocalReader = isNil(this.datasetsConfig) ? true : false;
                this.isServerReader = !this.isLocalReader;
                this.readerOptions = {
                    basePath: this._basePath,
                    fileReader: this.fileReader,
                    logger: this.logger,
                    datasetsConfig: this.datasetsConfig
                };
                this.reader = ddf_csv_1.ddfCsvReader(this.logger);
            },
            getAsset(asset) {
                const isJsonAsset = asset.slice(-'.json'.length) === '.json';
                let assetPath = `${this._basePath}/${asset}`;
                if (isObject(asset)) {
                    assetPath = ddf_query_validator_1.getDatasetPath(this._basePath, asset);
                }
                return new Promise((resolve, reject) => {
                    this.fileReader.readText(assetPath, (err, data) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        if (isJsonAsset) {
                            try {
                                resolve(JSON.parse(data));
                            }
                            catch (jsonErr) {
                                reject(err);
                            }
                        }
                        else {
                            resolve(data);
                        }
                    });
                });
            },
            read(queryParam, parsers) {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    let result;
                    try {
                        result = yield this.reader.query(queryParam, {
                            basePath: this._basePath,
                            datasetsConfig: this.datasetsConfig,
                            fileReader: this.fileReader,
                            logger: this.logger,
                            conceptsLookup: new Map(),
                            datapackagePath: '',
                            datasetPath: '',
                            dataset: ''
                        });
                        result = parsers ? this._prettifyData(result, parsers) : result;
                        if (this.resultTransformer) {
                            result = this.resultTransformer(result);
                        }
                        if (this.logger && this.logger.log) {
                            logger.log(JSON.stringify(queryParam), result.length);
                            logger.log(result);
                        }
                    }
                    catch (error) {
                        throw error;
                    }
                    return result;
                });
            },
            _prettifyData(data, parsers) {
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
        };
    };
}
exports.prepareDDFCsvReaderObject = prepareDDFCsvReaderObject;
//# sourceMappingURL=ddfcsv-reader.js.map