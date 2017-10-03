import { cloneDeep, isArray, isEmpty, includes } from 'lodash';
import { ContentManager } from '../content-manager';
import { IReader } from '../file-readers/reader';
import { RequestNormalizer } from '../request-normalizer';
import { IDdfAdapter } from './adapter';

export class DataPointSchemaAdapter implements IDdfAdapter {
  public contentManager: ContentManager;
  public reader: IReader;
  public ddfPath: string;
  public requestNormalizer: RequestNormalizer;
  public request;
  public baseData: any[];
  public dataPointsFromDataPackage: any[];

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
    this.dataPointsFromDataPackage = dataPackageContent.resources.filter(record => isArray(record.schema.primaryKey));

    for (let record of this.dataPointsFromDataPackage) {
      const measures = this.getMeasures(record);

      for (let measure of measures) {
        this.baseData.push({key: record.schema.primaryKey, value: measure});
      }
    }

    return this.dataPointsFromDataPackage;
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

    return this.dataPointsFromDataPackage.map(record => onFileRead => {
      this.reader.readCSV(`${this.ddfPath}${record.path}`, (err, data) => {
        // console.log(`${this.ddfPath}${record.path}`, data);
        // console.log(`${this.ddfPath}${record.path}`, this.getMeasures(record));

        onFileRead(err, []);
      });
    });
  }

  getFinalData(results) {
    return this.baseData;
  }

  private getMeasures(record: any): string[] {
    return record.schema.fields.filter(field =>
      !includes(record.schema.primaryKey, field.name)).map(field => field.name);
  }
}
