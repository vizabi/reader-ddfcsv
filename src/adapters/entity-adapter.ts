import {
  compact,
  cloneDeep,
  flatten,
  keys,
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

function getNormalizedBoolean(condition) {
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
  public translationReader: IReader;
  public ddfPath: string;
  public requestNormalizer: RequestNormalizer;
  public domainDescriptors: Array<any>;
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

  getNormalizedRequest(request, onRequestNormalized) {
    const allEntitySets = this.contentManager.concepts.filter(concept => concept.concept_type === 'entity_set');
    const relatedEntitySetsNames = flatten(
      request.select.key
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

  constructRecordDescriptor(record: any, filePath: string) {
    if (!this.recordsDescriptor[filePath]) {
      const recordKeys = keys(record);

      let mainKey = null;

      for (const key of recordKeys) {
        if (includes(this.contentManager.domainConcepts, key)) {
          mainKey = key;
          break;
        }

        if (includes(this.contentManager.entitySetConcepts, key)) {
          mainKey = key;
          break;
        }
      }

      this.recordsDescriptor[filePath] = {mainKey, translationHash: {}};
    }
  }

  getRecordTransformer() {
    const isTruth = value => value === 'true' || value === 'TRUE';

    return (record: any, filePath: string) => {
      const recordKeys = keys(record);
      const isTranslationExists = key =>
      this.recordsDescriptor[filePath] &&
      this.recordsDescriptor[filePath].translationHash &&
      this.recordsDescriptor[filePath].translationHash[record[this.recordsDescriptor[filePath].mainKey]] &&
      this.recordsDescriptor[filePath].translationHash[record[this.recordsDescriptor[filePath].mainKey]][key];

      this.constructRecordDescriptor(record, filePath);

      for (const key of recordKeys) {
        if (includes(this.contentManager.measureConcepts, key) && record[key]) {
          record[key] = Number(record[key]);
        }

        if (includes(this.contentManager.measureConcepts, key) && !record[key]) {
          record[key] = null;
        }

        if (isTranslationExists(key)) {
          record[key] = this.recordsDescriptor[filePath].translationHash[record[this.recordsDescriptor[filePath].mainKey]][key];
        }
      }

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

  getTranslationRecordTransformer() {
    return (record: any, filePath: string) => {
      const dataFilePath = filePath.replace(new RegExp(`lang/${this.request.language}/`), '');

      this.constructRecordDescriptor(record, dataFilePath);
      this.recordsDescriptor[dataFilePath].translationHash[record[this.recordsDescriptor[dataFilePath].mainKey]] = record;

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
