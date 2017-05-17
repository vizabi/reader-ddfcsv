import {
  cloneDeep,
  flatten,
  isEmpty,
  keys,
  reduce,
  replace,
  includes,
  uniq,
  startsWith
} from 'lodash';
import * as traverse from 'traverse';
import { ContentManager } from '../content-manager';
import { IReader } from '../file-readers/reader';
import { RequestNormalizer } from '../request-normalizer';
import { IDdfAdapter } from './adapter';
import { getSchemaDetailsByKey } from './shared';

const Mingo = require('mingo');

function getNormalizedBoolean(conditionParam) {
  const condition = cloneDeep(conditionParam);
  const conditionToTraverse = traverse(condition);

  function processConditionBranch() {
    if (startsWith(this.key, 'is--')) {
      conditionToTraverse.set(this.path, this.node === true ? 'TRUE' : 'FALSE');
    }
  }

  conditionToTraverse.forEach(processConditionBranch);

  return condition;
}

function getSynonymicConceptIds(conditionParam) {
  const condition = cloneDeep(conditionParam);
  const conditionToTraverse = traverse(condition);
  const result = [];

  function processConditionBranch() {
    if (startsWith(this.key, 'is--')) {
      result.push(replace(this.key, 'is--', ''));
    }
  }

  conditionToTraverse.forEach(processConditionBranch);

  return uniq(result);
}

function getSynonymicCondition(conditionParam, synonimicConceptIds, allEntityDomains) {
  const result: any = {};

  keys(conditionParam).forEach(key => {
    if (!includes(allEntityDomains, key) || isEmpty(synonimicConceptIds)) {
      result[key] = conditionParam[key];
      return;
    }

    result['$or'] = [{[key]: conditionParam[key]}];

    synonimicConceptIds.forEach(synonymicConceptId => {
      result['$or'].push({[synonymicConceptId]: conditionParam[key]});
    });
  });

  return result;
}

export class JoinsAdapter implements IDdfAdapter {
  public contentManager: ContentManager;
  public reader: IReader;
  public ddfPath: string;
  public requestNormalizer: RequestNormalizer;
  public synonymicConceptIds: Array<string>;

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
    return getSchemaDetailsByKey(request, dataPackageContent, 'entities');
  }

  isEntitySetConcept(conceptName) {
    return this.contentManager.conceptTypeHash[conceptName] === 'entity_set';
  }

  getNormalizedRequest(request, onRequestNormalized) {
    const allEntitySets = this.contentManager.concepts.filter(concept => concept.concept_type === 'entity_set');
    const allEntityDomains = this.contentManager.concepts
      .filter(concept => concept.concept_type === 'entity_domain').map(concept => concept.concept);
    const synonymicConceptIds = getSynonymicConceptIds(request.where);
    const relatedEntitySetsNames = flatten(
      allEntitySets
        .filter(entitySet => entitySet.domain === request.key)
        .filter(entitySet => includes(synonymicConceptIds, entitySet.concept))
        .map(entitySet => entitySet.concept)
    );

    this.synonymicConceptIds = synonymicConceptIds;

    request.key = [request.key].concat(relatedEntitySetsNames);
    request.where = getSynonymicCondition(getNormalizedBoolean(request.where), synonymicConceptIds, allEntityDomains);

    onRequestNormalized(null, request);
  }

  getRecordTransformer() {
    return null;
  }

  getFileActions(expectedFiles) {
    return expectedFiles.map(file => onFileRead => {
      this.reader.readCSV(`${this.ddfPath}${file}`,
        (err, data) => onFileRead(err, {file, data}));
    });
  }

  getTimeConcept(concepts) {
    for (const concept of concepts) {
      if (includes(this.contentManager.timeConcepts, concept)) {
        return concept;
      }
    }

    return null;
  }

  getTimeBasedCondition(relatedData, request) {
    const timeConcept = this.getTimeConcept(request.key);

    let result = null;

    if (isEmpty(relatedData) && timeConcept) {
      result = request.where[timeConcept];
    }

    return result;
  }

  getArrayBasedCondition(relatedData, request) {
    let result = null;

    if (!isEmpty(relatedData)) {
      result = {$or: []};

      request.key.forEach(expectedField => {
        result.$or.push({[expectedField]: {$in: relatedData}});
      });
    }

    return result;
  }

  getPrimaryKeyByFile(file: string): string & Array<string> {
    const primaryKeyHash = {};

    for (const resource of this.contentManager.dataPackage.resources) {
      primaryKeyHash[resource.path] = resource.schema.primaryKey;
    }

    return primaryKeyHash[file];
  }

  getFinalData(results, request) {
    const data = [];

    for (const result of results) {
      const primaryKey = this.getPrimaryKeyByFile(result.file);
      const domain = this.contentManager.domainHash[primaryKey];
      const tempData = flatten(result.data);

      for (const record of tempData) {
        if (domain) {
          record[domain] = record[primaryKey];
        }

        data.push(record);
      }
    }

    const projection = reduce(
      request.key,
      (currentProjection, field: string) => {
        currentProjection[field] = 1;

        return currentProjection;
      },
      {});
    const query = new Mingo.Query(request.where);
    const expectedIds = this.synonymicConceptIds.concat(keys(projection));
    const relatedData = query.find(data).all().map(record => {
      let value = null;

      for (const expectedId of expectedIds) {
        if (record[expectedId]) {
          value = record[expectedId];
          break;
        }
      }

      return value;
    });

    return this.getArrayBasedCondition(relatedData, request) ||
      this.getTimeBasedCondition(relatedData, request);
  }
}
