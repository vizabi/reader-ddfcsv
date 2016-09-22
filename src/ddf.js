import {ContentManager} from './content-manager';
import {ConceptAdapter} from './adapters/concept-adapter';
import {EntityAdapter} from './adapters/entity-adapter';
import {JoinsAdapter} from './adapters/joins-adapter';
import {DataPointAdapter} from './adapters/datapoint-adapter';
import {RequestNormalizer} from './request-normalizer';

import parallel from 'async-es/parallel';

import cloneDeep from 'lodash/cloneDeep';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import flatten from 'lodash/flatten';
import sortBy from 'lodash/sortBy';
import startsWith from 'lodash/startsWith';
import uniq from 'lodash/uniq';

const traverse = require('traverse');
const contentManager = new ContentManager();
const ADAPTERS = {
  concepts: ConceptAdapter,
  entities: EntityAdapter,
  joins: JoinsAdapter,
  datapoints: DataPointAdapter
};

function postProcessing(requestParam, data) {
  if (!isArray(data)) {
    return data;
  }

  let processedData = data.map(record => {
    Object.keys(record).forEach(key => {
      if (isObject(record[key])) {
        record[key] = JSON.stringify(record[key]);
      }
    });

    return record;
  });

  if (!isEmpty(requestParam.order_by) && isString(requestParam.order_by)) {
    processedData = sortBy(processedData, requestParam.order_by);
  }

  return processedData;
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
        contentManager.timeConcepts = conceptsData
          .filter(concept => concept.concept_type === 'time')
          .map(concept => concept.concept);

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

  /* eslint-disable no-invalid-this */

  getRelationKeysDescriptors(requestParam) {
    const condition = cloneDeep(requestParam.where);
    const conditionToTraverse = traverse(condition);
    const relationKeysDescriptors = [];

    function processConditionBranch() {
      if (startsWith(this.node, '$') && this.isLeaf) {
        relationKeysDescriptors.push({
          value: this.node,
          path: this.path
        });
      }
    }

    conditionToTraverse.forEach(processConditionBranch);

    return relationKeysDescriptors;
  }

  /* eslint-enable no-invalid-this */

  getJoinProcessors(requestParam, relationKeysDescriptors) {
    return relationKeysDescriptors
      .map(relationKeyDescriptor => onJoinProcessed => {
        if (!requestParam.join || !requestParam.join[relationKeyDescriptor.value]) {
          onJoinProcessed(new Error(`join for relation ${relationKeyDescriptor.value} is not found!`));
          return;
        }

        const joinRequest = cloneDeep(requestParam.join[relationKeyDescriptor.value]);

        joinRequest.from = 'joins';

        this.processRequest(joinRequest, null, (err, condition) =>
          onJoinProcessed(err, {relationKeyDescriptor, condition}));
      });
  }

  processRequest(requestParam, requestNormalizer, onRequestProcessed) {
    const request = cloneDeep(requestParam);

    const ddfTypeAdapter =
      new ADAPTERS[request.from](contentManager, this.reader, this.ddfPath)
        .addRequestNormalizer(requestNormalizer);

    ddfTypeAdapter.getNormalizedRequest(request, (normError, normRequest) => {
      if (normError) {
        onRequestProcessed(normError);
        return;
      }

      const expectedIndexData =
        ddfTypeAdapter.getExpectedIndexData(normRequest, contentManager.index);
      const expectedFiles = uniq(expectedIndexData.map(indexRecord => indexRecord.file));

      this.reader.setRecordTransformer(ddfTypeAdapter.getRecordTransformer(normRequest));

      const fileActions = ddfTypeAdapter.getFileActions(expectedFiles);

      parallel(fileActions, (err, results) => onRequestProcessed(
        err,
        postProcessing(requestParam, ddfTypeAdapter.getFinalData(results, normRequest)))
      );
    });
  }

  ddfRequest(requestParam, onDdfRequestProcessed) {
    this.getIndex(indexErr => {
      if (indexErr) {
        onDdfRequestProcessed(indexErr);
        return;
      }

      const requestNormalizer = new RequestNormalizer(requestParam, contentManager);
      const request = requestNormalizer.getNormalized();
      const relationKeysDescriptors = this.getRelationKeysDescriptors(request);

      parallel(this.getJoinProcessors(request, relationKeysDescriptors), (err, results) => {
        if (err) {
          onDdfRequestProcessed(err);
          return;
        }

        const normalRequestCondition = traverse(request.where);

        results.forEach(result => {
          normalRequestCondition.set(result.relationKeyDescriptor.path, result.condition);
        });

        request.where = normalRequestCondition.value;

        this.processRequest(request, requestNormalizer, (mainError, data) => {
          onDdfRequestProcessed(mainError, data);
        });
      });
    });
  }
}
