import * as Mingo from 'mingo';

import cloneDeep from 'lodash/cloneDeep';
import flatten from 'lodash/flatten';
import reduce from 'lodash/reduce';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import {getResourcesFilteredBy} from './shared';

export class ConceptAdapter {
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
    const request = cloneDeep(requestParam);

    onRequestNormalized(null, request);
  }

  /* eslint-disable no-empty */

  getRecordTransformer() {
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

  /* eslint-enable no-empty */

  getFileActions(expectedFiles) {
    return expectedFiles.map(file => onFileRead => {
      this.reader.readCSV(`${this.ddfPath}${file}`, onFileRead);
    });
  }

  getFinalData(results, request) {
    const data = flatten(results);
    const fields = request.select.key.concat(request.select.value);
    const projection = reduce(
      fields,
      (currentProjection, field) => {
        currentProjection[field] = 1;

        return currentProjection;
      },
      {});
    const query = new Mingo.Query(request.where, projection);

    return query.find(data).all();
  }
}
