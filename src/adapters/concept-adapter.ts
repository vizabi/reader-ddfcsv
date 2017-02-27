import {cloneDeep, flatten, keys, reduce, includes, isEmpty} from 'lodash';
import {getResourcesFilteredBy} from './shared';
import {ContentManager} from '../content-manager';
import {IReader} from '../file-readers/reader';
import {RequestNormalizer} from '../request-normalizer';
import {IDdfAdapter} from './adapter';

const Mingo = require('mingo');

export class ConceptAdapter implements IDdfAdapter {
  public contentManager: ContentManager;
  public reader: IReader;
  public translationReader: IReader;
  public ddfPath: string;
  public requestNormalizer: RequestNormalizer;
  public request: any;

  private recordsDescriptor: any = {};

  constructor(contentManager, reader, ddfPath) {
    this.contentManager = contentManager;
    this.reader = cloneDeep(reader);
    this.translationReader = cloneDeep(reader);
    this.ddfPath = ddfPath;
  }

  addRequestNormalizer(requestNormalizer) {
    this.requestNormalizer = requestNormalizer;

    return this;
  }

  getDataPackageFilteredBySelect(request, dataPackageContent): any {
    return getResourcesFilteredBy(dataPackageContent, (dataPackage, record) =>
      includes(request.select.key, record.schema.primaryKey));
  }

  getNormalizedRequest(request, onRequestNormalized) {
    this.request = request;

    onRequestNormalized(null, request);
  }

  getRecordTransformer(): any {
    return (record: any, filePath: string) => {
      const isTranslationExists = key =>
      this.recordsDescriptor[filePath] &&
      this.recordsDescriptor[filePath].translationHash &&
      this.recordsDescriptor[filePath].translationHash[record.concept] &&
      this.recordsDescriptor[filePath].translationHash[record.concept][key];

      if (record.color && !isEmpty(record.color)) {
        try {
          record.color = JSON.parse(record.color);
        } catch (exc) {
        }
      }

      const recordKeys = keys(record);

      for (const key of recordKeys) {
        if (isTranslationExists(key)) {
          record[key] = this.recordsDescriptor[filePath].translationHash[record.concept][key];
        }
      }

      return record;
    };
  }

  getTranslationRecordTransformer() {
    return (record: any, filePath: string) => {
      const dataFilePath = filePath.replace(new RegExp(`lang/${this.request.language}/`), '');

      if (!this.recordsDescriptor[dataFilePath]) {
        this.recordsDescriptor[dataFilePath] = {translationHash: {}};
      }

      this.recordsDescriptor[dataFilePath].translationHash[record.concept] = record;

      return record;
    };
  }

  getFileActions(expectedFiles, request) {
    const translationsFileActions = () => expectedFiles.map(file => onFileRead => {
      this.translationReader.setRecordTransformer(this.getTranslationRecordTransformer());
      this.translationReader.readCSV(`${this.ddfPath}lang/${request.language}/${file}`,
        () => {
          this.reader.readCSV(`${this.ddfPath}${file}`, onFileRead);
        });
    });
    const noTranslationsFileActions = () => expectedFiles.map(file => onFileRead => {
      this.reader.readCSV(`${this.ddfPath}${file}`, onFileRead);
    });
    const isTranslationActionsNeeded = includes(this.contentManager.translationIds, request.language);
    const fileActions = isTranslationActionsNeeded ? translationsFileActions : noTranslationsFileActions;

    return fileActions();
  }

  getFinalData(results, request): Array<any> {
    const data = flatten(results);
    const fields = request.select.key.concat(request.select.value);
    const projection = reduce(
      fields,
      (currentProjection, field: string) => {
        currentProjection[field] = 1;

        return currentProjection;
      },
      {});
    const query = new Mingo.Query(request.where, projection);

    return query.find(data).all();
  }
}
