import {cloneDeep, flatten, reduce, includes, isEmpty} from 'lodash';
import {getResourcesFilteredBy} from './shared';
import {ContentManager} from '../content-manager';
import {IReader} from '../file-readers/reader';
import {RequestNormalizer} from '../request-normalizer';
import {IDdfAdapter} from './adapter';

const Mingo = require('mingo');

export class ConceptAdapter implements IDdfAdapter {
  public contentManager: ContentManager;
  public reader: IReader;
  public ddfPath: string;
  public requestNormalizer: RequestNormalizer;

  constructor(contentManager, reader, ddfPath) {
    this.contentManager = contentManager;
    this.reader = cloneDeep(reader);
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

  getNormalizedRequest(requestParam, onRequestNormalized) {
    const request = cloneDeep(requestParam);

    onRequestNormalized(null, request);
  }

  getRecordTransformer(): any {
    return record => {
      if (record.color && !isEmpty(record.color)) {
        try {
          record.color = JSON.parse(record.color);
        } catch (exc) {
        }
      }

      return record;
    };
  }

  getFileActions(expectedFiles): Array<any> {
    return expectedFiles.map(file => onFileRead => {
      this.reader.readCSV(`${this.ddfPath}${file}`, onFileRead);
    });
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
