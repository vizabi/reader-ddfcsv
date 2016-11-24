import includes from 'lodash/includes';
import {getResourcesFilteredBy} from './shared';

export class EntitySchemaAdapter {
  constructor(contentManager, reader, ddfPath) {
    this.contentManager = contentManager;
    this.reader = reader;
    this.ddfPath = ddfPath;
  }

  addRequestNormalizer(requestNormalizer) {
    this.requestNormalizer = requestNormalizer;

    return this;
  }

  getDataPackageFilteredBySelect(request, dataPackageContent) {
    return getResourcesFilteredBy(dataPackageContent, (dataPackage, record) =>
      includes(request.select.key, record.schema.primaryKey));
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
