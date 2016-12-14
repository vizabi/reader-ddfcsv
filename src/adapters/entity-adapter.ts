import {
  compact,
  cloneDeep,
  flatten,
  reduce,
  includes,
  isEmpty,
  startsWith,
  uniq
} from 'lodash';
import {getResourcesFilteredBy} from './shared';
import {ContentManager} from '../content-manager';
import {IReader} from '../file-readers/reader';
import {RequestNormalizer} from '../request-normalizer';
import * as traverse from 'traverse';
import {IDdfAdapter} from './adapter';

const Mingo = require('mingo');
const VALUE_WITH_PREFIX_REGEX = /^.*\./;

function getCroppedKeys(conditionParam) {
  const condition = cloneDeep(conditionParam);
  const conditionToTraverse = traverse(condition);

  function processConditionBranch() {
    if (includes(this.key, '.') && this.isLeaf) {
      this.path[this.path.length - 1] = this.key.replace(VALUE_WITH_PREFIX_REGEX, '');
      conditionToTraverse.set(this.path, this.node);
      this.remove();
    }
  }

  conditionToTraverse.forEach(processConditionBranch);

  return condition;
}

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

export class EntityAdapter implements IDdfAdapter {
  public contentManager: ContentManager;
  public reader: IReader;
  public ddfPath: string;
  public requestNormalizer: RequestNormalizer;
  public domainDescriptors: Array<any>;
  public request: any;

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
    const domain = this.contentManager.domainHash[request.select.key];
    const isFieldPresent = (record, fieldIs) => !!record.schema.fields.find(field => field.name === `is--${fieldIs}`);

    return getResourcesFilteredBy(dataPackageContent, (dataPackage, record) =>
    includes(request.select.key, record.schema.primaryKey) ||
    (includes(domain, record.schema.primaryKey) && isFieldPresent(record, request.select.key)));
  }

  getDomainDescriptorsByRequestKeys(requestKey) {
    return compact(uniq(
      requestKey
        .map(key => ({key, domain: this.contentManager.domainHash[key]}))
        .filter(descriptor => !!descriptor.domain)
    ));
  }

  getNormalizedRequest(requestParam, onRequestNormalized) {
    const request = cloneDeep(requestParam);
    const allEntitySets = this.contentManager.concepts.filter(concept => concept.concept_type === 'entity_set');
    const relatedEntitySetsNames = flatten(
      requestParam.select.key
        .map(key => allEntitySets
          .filter(entitySet => entitySet.domain === key)
          .map(entitySet => entitySet.concept))
    );

    request.select.key = request.select.key.concat(relatedEntitySetsNames);
    request.select.value = request.select.value
      .map(value => value.replace(VALUE_WITH_PREFIX_REGEX, ''))
      .filter(value => value !== '_default');
    request.where = getNormalizedBoolean(getCroppedKeys(request.where));

    this.domainDescriptors = this.getDomainDescriptorsByRequestKeys(request.select.key);
    this.request = request;

    onRequestNormalized(null, request);
  }

  getRecordTransformer() {
    const isTruth = value => value === 'true' || value === 'TRUE';

    return record => {
      if (!isEmpty(this.domainDescriptors)) {
        for (const domainDescriptor of this.domainDescriptors) {
          if (isTruth(record[`is--${domainDescriptor.key}`]) && isEmpty(record[domainDescriptor.domain])) {
            record[domainDescriptor.domain] = record[domainDescriptor.key];
            continue;
          }

          if (isEmpty(record[domainDescriptor.key]) && !isEmpty(record[domainDescriptor.domain])) {
            record[domainDescriptor.key] = record[domainDescriptor.domain];
          }
        }
      }

      return record;
    };
  }

  getFileActions(expectedFiles) {
    return expectedFiles.map(file => onFileRead => {
      this.reader.readCSV(`${this.ddfPath}${file}`,
        (err, data) => onFileRead(err, data));
    });
  }

  getFinalData(results, request) {
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
