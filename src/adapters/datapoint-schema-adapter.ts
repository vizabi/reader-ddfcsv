import { cloneDeep, isArray, isEmpty, includes, head, flatten } from 'lodash';
import { parallelLimit } from 'async';
import { ContentManager } from '../content-manager';
import { IReader } from '../file-readers/reader';
import { RequestNormalizer } from '../request-normalizer';
import { IDdfAdapter } from './adapter';

const Mingo = require('mingo');

export class DataPointDescriptor {
  constructor(public primaryKey: string[], public measure: string, public files: string[] = []) {
  }
}

export class DataPointSchemaAdapter implements IDdfAdapter {
  public contentManager: ContentManager;
  public reader: IReader;
  public ddfPath: string;
  public requestNormalizer: RequestNormalizer;
  public request;
  public baseData: any[];
  public dataPointDescriptors: DataPointDescriptor[];

  constructor(contentManager, reader, ddfPath) {
    this.contentManager = contentManager;
    this.reader = cloneDeep(reader);
    this.ddfPath = ddfPath;
  }

  addRequestNormalizer(requestNormalizer) {
    this.requestNormalizer = requestNormalizer;

    return this;
  }

  getExpectedSchemaDetails(request, dataPackageContent) {
    this.baseData = [];

    const resourceToPath = dataPackageContent.resources
      .filter(record => isArray(record.schema.primaryKey))
      .reduce((hash, record) => {
        hash[record.name] = record.path;

        return hash;
      }, {});

    this.dataPointDescriptors = dataPackageContent.ddfSchema.datapoints.map(schemaRecord => {
      const files = schemaRecord.resources.map(resource => resourceToPath[resource]);

      return new DataPointDescriptor(schemaRecord.primaryKey, schemaRecord.value, files);
    });

    for (let dataPointDescriptor of this.dataPointDescriptors) {
      this.baseData.push({key: dataPointDescriptor.primaryKey, value: dataPointDescriptor.measure});
    }

    return [];
  }

  getNormalizedRequest(requestParam, onRequestNormalized) {
    this.request = requestParam;

    onRequestNormalized(null, requestParam);
  }

  getRecordTransformer() {
    return record => record;
  }

  getFileActions(expectedFiles) {
    if (!this.request.select || isEmpty(this.request.select.value)) {
      return [];
    }

    const fileActions = this.dataPointDescriptors.map(dataPointDescriptor => onDataPointsProcessed => {
      const FILES_TO_PROCESS = 10;
      const fileActions = dataPointDescriptor.files.map(file => onFileRead => {
        this.reader.readCSV(`${this.ddfPath}${file}`, onFileRead);
      });

      parallelLimit(fileActions, FILES_TO_PROCESS, (err, results) => {
        if (err) {
          onDataPointsProcessed(err);
          return;
        }

        const data = flatten(results);
        const group = {_id: null};

        for (let value of this.request.select.value) {
          group[value] = {[`$${this.getFunction(value)}`]: `$${dataPointDescriptor.measure}`};
        }

        const aggregatedResult = Mingo.aggregate(data, [{$group: group}]);
        const result = aggregatedResult.map(record => this.getResultRowByAggregation(record, dataPointDescriptor));

        onDataPointsProcessed(null, result);
      });
    });

    return fileActions;
  }

  getFinalData(results) {
    if (isEmpty(results)) {
      return this.baseData;
    } else {
      this.baseData = [];

      return results;
    }
  }

  private getFunction(expression: string): string {
    const expressionRegex = /([a-z]+)\(.+\)/;
    const match = expressionRegex.exec(expression);

    return match[1];
  }

  private getResultRowByAggregation(record: any, dataPointDescriptor: DataPointDescriptor): any {
    const result = {key: dataPointDescriptor.primaryKey, value: dataPointDescriptor.measure};

    for (let value of this.request.select.value) {
      result[value] = record[value];
    }

    return result;
  }
}
