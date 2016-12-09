import {isEqual, cloneDeep} from 'lodash';
import {getResourcesFilteredBy} from './shared';
import {ContentManager} from '../content-manager';
import {IReader} from '../file-readers/reader';
import {RequestNormalizer} from '../request-normalizer';
import {IDdfAdapter} from './adapter';

export class DataPointSchemaAdapter implements IDdfAdapter {
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

  getDataPackageFilteredBySelect(request, dataPackageContent) {
    return getResourcesFilteredBy(dataPackageContent, (dataPackage, record) =>
      isEqual(request.select.key, record.schema.primaryKey));
  }

  getNormalizedRequest(requestParam, onRequestNormalized) {
    onRequestNormalized(null, requestParam);
  }

  getRecordTransformer() {
    return record => record;
  }

  getFileActions(expectedFiles) {
    return expectedFiles.map(file => onFileRead => {
      this.reader.getFileSchema(`${this.ddfPath}${file}`,
        (err, data) => onFileRead(err, data));
    });
  }

  getFinalData(results) {
    return results;
  }
}
