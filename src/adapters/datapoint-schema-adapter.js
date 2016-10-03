import isEqual from 'lodash/isEqual';
import split from 'lodash/split';

export class DataPointSchemaAdapter {
  constructor(contentManager, reader, ddfPath) {
    this.contentManager = contentManager;
    this.reader = reader;
    this.ddfPath = ddfPath;
  }

  addRequestNormalizer(requestNormalizer) {
    this.requestNormalizer = requestNormalizer;

    return this;
  }

  getExpectedIndexData(request, indexData) {
    return indexData
      .filter(indexRecord => isEqual(request.select.key, split(indexRecord.key, ',')));
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
