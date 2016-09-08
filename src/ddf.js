import {ContentManager} from './content-manager';
import {ConceptAdapter} from './concept-adapter';
import {EntityAdapter} from './entity-adapter';
import {DataPointAdapter} from './datapoint-adapter';

import parallel from 'async-es/parallel';

import cloneDeep from 'lodash/cloneDeep';
import isObject from 'lodash/isObject';
import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';

const contentManager = new ContentManager();

const ADAPTERS = {
  concepts: ConceptAdapter,
  entities: EntityAdapter,
  datapoints: DataPointAdapter
};

function postProcessing(data) {
  return data.map(record => {
    Object.keys(record).forEach(key => {
      if (isObject(record[key])) {
        record[key] = JSON.stringify(record[key]);
      }
    });

    return record;
  });
}

export class Ddf {
  constructor(ddfPath, reader) {
    this.ddfPath = ddfPath;
    this.reader = cloneDeep(reader);

    if (this.ddfPath[this.ddfPath.length - 1] !== '/') {
      this.ddfPath += '/';
    }
  }

  getIndex(onIndexLoaded) {
    const indexFileName = `${this.ddfPath}ddf--index.csv`;

    this.reader.read(indexFileName, (indexError, indexData) => {
      if (indexError) {
        onIndexLoaded(indexError);
        return;
      }

      contentManager.index = indexData;

      this.getConcepts((conceptsError, conceptsData) => {
        if (conceptsError) {
          onIndexLoaded(conceptsError);
          return;
        }

        contentManager.concepts = conceptsData;
        contentManager.domainHash = {};
        conceptsData
          .filter(concept => concept.concept_type === 'entity_set')
          .forEach(concept => {
            contentManager.domainHash[concept.concept] = concept.domain;
          });
        contentManager.conceptTypeHash = {};
        conceptsData
          .forEach(concept => {
            contentManager.conceptTypeHash[concept.concept] = concept.concept_type;
          });

        onIndexLoaded(null, contentManager.index);
      });
    });
  }

  getConcepts(onConceptsLoaded) {
    const conceptFiles = uniq(
      contentManager.index
        .filter(record => record.key === 'concept')
        .map(record => record.file)
    );
    const actions = conceptFiles.map(file => onFileRead => {
      this.reader.read(`${this.ddfPath}${file}`, (err, data) => onFileRead(err, data));
    });

    parallel(actions, (err, results) => onConceptsLoaded(err, flatten(results)));
  }

  processRequest(requestParam, onRequestProcessed) {
    this.getIndex((indexErr, indexData) => {
      if (indexErr) {
        onRequestProcessed(indexErr);
        return;
      }

      const ddfTypeAdapter =
        new ADAPTERS[requestParam.from](contentManager, this.reader, this.ddfPath);

      ddfTypeAdapter.getNormalizedRequest(requestParam, (normError, normRequest) => {
        if (normError) {
          onRequestProcessed(normError);
          return;
        }

        const expectedIndexData = ddfTypeAdapter.getExpectedIndexData(normRequest, indexData);
        const expectedFiles = uniq(expectedIndexData.map(indexRecord => indexRecord.file));

        this.reader.setRecordTransformer(ddfTypeAdapter.getRecordTransformer(normRequest));

        const fileActions = ddfTypeAdapter.getFileActions(expectedFiles);

        parallel(fileActions, (err, results) => onRequestProcessed(
          err,
          postProcessing(ddfTypeAdapter.getFinalData(results, normRequest)))
        );
      });
    });
  }
}
