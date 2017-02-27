import {EntityUtils} from '../entity-utils';
import {
  cloneDeep,
  head,
  isEmpty,
  isEqual,
  isInteger,
  intersection,
  includes,
  keys,
  map,
  reduce,
  values
} from 'lodash';
import {getResourcesFilteredBy} from './shared';
import * as timeUtils from 'ddf-time-utils';
import {ContentManager} from '../content-manager';
import {IReader} from '../file-readers/reader';
import {RequestNormalizer} from '../request-normalizer';
import {IDdfAdapter} from './adapter';

const Mingo = require('mingo');

const timeValuesHash = {};
const timeDescriptorHash = {};

function getTimeDescriptor(time) {
  if (!timeDescriptorHash[time]) {
    timeDescriptorHash[time] = timeUtils.parseTime(time);
  }

  return timeDescriptorHash[time];
}

export class EntityDescriptor {
  public contentManager: ContentManager;
  public domain: string;
  public entity: string;

  constructor(entity: string, contentManager: ContentManager) {
    this.contentManager = contentManager;

    if (this.isEntitySetConcept(entity)) {
      this.domain = this.contentManager.domainHash[entity];
      this.entity = entity;
    }

    if (!this.isEntitySetConcept(entity)) {
      this.domain = entity;
    }
  }

  isEntitySetConcept(conceptName) {
    return this.contentManager.conceptTypeHash[conceptName] === 'entity_set';
  }
}

export class DataPointAdapter implements IDdfAdapter {
  public contentManager: ContentManager;
  public reader: IReader;
  public translationReader: IReader;
  public ddfPath: string;
  public requestNormalizer: RequestNormalizer;
  public entitySetsHash: any;
  public request: any;

  private recordsDescriptor: any = {};

  constructor(contentManager, reader, ddfPath) {
    this.contentManager = contentManager;
    this.reader = cloneDeep(reader);
    this.translationReader = cloneDeep(reader);
    this.ddfPath = ddfPath;
    this.entitySetsHash = {};

    keys(this.contentManager.domainHash).forEach(entitySet => {
      const entityDomain = this.contentManager.domainHash[entitySet];

      if (!this.entitySetsHash[entityDomain]) {
        this.entitySetsHash[entityDomain] = [];
      }

      this.entitySetsHash[entityDomain].push(entitySet);
    });
  }

  addRequestNormalizer(requestNormalizer) {
    this.requestNormalizer = requestNormalizer;

    return this;
  }

  getDataPackageFilteredBySelect(request, dataPackageContent) {
    const matchByValue = (dataPackage, record) => {
      const fields = map(record.schema.fields, 'name');

      return !isEmpty(intersection(fields, request.select.value));
    };
    const matchByEntityAndValue = (dataPackage, record) => {
      const isMatchedByKey = isEqual(request.select.key, record.schema.primaryKey);

      return isMatchedByKey && matchByValue(dataPackage, record);
    };
    const matchByEntityDomainAndValue = (dataPackage, record) => {
      const isMatchedByDomain = !isEmpty(intersection(keys(this.entitySetsHash), request.select.key));

      return isMatchedByDomain && matchByValue(dataPackage, record);
    };

    let result = getResourcesFilteredBy(dataPackageContent, matchByEntityAndValue);

    if (isEmpty(result)) {
      result = getResourcesFilteredBy(dataPackageContent, matchByEntityDomainAndValue);
    }
    return result;
  }

  getNormalizedRequest(request, onRequestNormalized) {
    const entityUtils = new EntityUtils(this.contentManager, this.reader, this.ddfPath, request.where);

    entityUtils.transformConditionByDomain((err, transformedCondition) => {
      request.where = transformedCondition;
      this.request = request;

      onRequestNormalized(err, request);
    });
  }

  constructRecordDescriptor(record: any, filePath: string) {
    if (!this.recordsDescriptor[filePath]) {
      const recordKeys = keys(record);

      let mainEntitiesKey: Array<string> = [];
      let mainTimeKey = null;

      for (const key of recordKeys) {
        if (includes(this.contentManager.domainConcepts, key)) {
          mainEntitiesKey.push(key);
        }

        if (includes(this.contentManager.entitySetConcepts, key)) {
          mainEntitiesKey.push(key);
        }

        if (includes(this.contentManager.timeConcepts, key)) {
          mainTimeKey = key;
        }
      }

      const entityDescriptors = this.getEntityDescriptors(mainEntitiesKey);
      const mainKey = `${this.getEntitiesHolderKey(record, entityDescriptors)},${record[mainTimeKey]}`;

      this.recordsDescriptor[filePath] = {mainKey, translationHash: {}};
    }
  }

  getRecordTransformer(request) {
    const measures = this.contentManager.concepts
      .filter(conceptRecord => conceptRecord.concept_type === 'measure')
      .map(conceptRecord => conceptRecord.concept);
    const expectedMeasures = intersection(measures, request.select.value);
    const times = this.contentManager.concepts
      .filter(conceptRecord => conceptRecord.concept_type === 'time')
      .map(conceptRecord => conceptRecord.concept);
    const transformNumbers = record => {
      for (const keyToTransform of expectedMeasures) {
        if (record[keyToTransform] && record[keyToTransform]) {
          record[keyToTransform] = Number(record[keyToTransform]);
        }
      }
    };

    const transformTimes = record => {
      let isRecordAvailable = true;

      for (const keyToTransform of times) {
        const timeDescriptor = getTimeDescriptor(record[keyToTransform]);

        if (timeDescriptor) {
          if (this.requestNormalizer.timeType && timeDescriptor.type !== this.requestNormalizer.timeType) {
            isRecordAvailable = false;
            break;
          }

          if (!timeValuesHash[keyToTransform]) {
            timeValuesHash[keyToTransform] = {};
          }

          timeValuesHash[keyToTransform][timeDescriptor.time] = record[keyToTransform];
          record[keyToTransform] = timeDescriptor.time;
        }
      }

      return isRecordAvailable;
    };

    return (record: any, filePath: string) => {
      const recordKeys = keys(record);
      const isTranslationExists = key =>
      this.recordsDescriptor[filePath] &&
      this.recordsDescriptor[filePath].translationHash &&
      this.recordsDescriptor[filePath].translationHash[record[this.recordsDescriptor[filePath].mainKey]] &&
      this.recordsDescriptor[filePath].translationHash[record[this.recordsDescriptor[filePath].mainKey]][key];

      this.constructRecordDescriptor(record, filePath);

      for (const key of recordKeys) {
        if (isTranslationExists(key)) {
          record[key] = this.recordsDescriptor[filePath].translationHash[record[this.recordsDescriptor[filePath].mainKey]][key];
        }
      }

      transformNumbers(record);

      const isRecordAvailable = transformTimes(record);

      return isRecordAvailable ? record : null;
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

  isTimeConcept(conceptName) {
    return this.contentManager.conceptTypeHash[conceptName] === 'time';
  }

  isMeasureConcept(conceptName) {
    return this.contentManager.conceptTypeHash[conceptName] === 'measure';
  }

  isEntitySetConcept(conceptName) {
    return this.contentManager.conceptTypeHash[conceptName] === 'entity_set';
  }

  isDomainRelatedConcept(conceptName) {
    const container = this.contentManager.conceptTypeHash;

    return container[conceptName] === 'entity_domain' || this.isEntitySetConcept(conceptName);
  }

  getEntityFieldsByFirstRecord(record): Array<string> {
    return Object.keys(record).filter(conceptName => this.isDomainRelatedConcept(conceptName));
  }

  getTimeFieldByFirstRecord(record): string {
    return Object.keys(record).find(conceptName => this.isTimeConcept(conceptName));
  }

  getMeasureFieldByFirstRecord(record): string {
    return Object.keys(record).find(conceptName => this.isMeasureConcept(conceptName));
  }

  getFileActions(expectedFiles, request) {
    const readData = (file, onFileRead) => {
      this.reader.readCSV(`${this.ddfPath}${file}`, (err, data) => {
        if (err || isEmpty(data)) {
          onFileRead(err, [], {});
          return;
        }

        const firstRecord = head(data);
        const entityFields = this.getEntityFieldsByFirstRecord(firstRecord);
        const timeField = this.getTimeFieldByFirstRecord(firstRecord);
        const measureField = this.getMeasureFieldByFirstRecord(firstRecord);

        onFileRead(null, {data, entityFields, timeField, measureField});
      });
    };
    const translationsFileActions = () => expectedFiles.map(file => onFileRead => {
      this.translationReader.setRecordTransformer(this.getTranslationRecordTransformer());
      this.translationReader.readCSV(`${this.ddfPath}lang/${this.request.language}/${file}`,
        () => readData(file, onFileRead));
    });
    const noTranslationsFileActions = () => expectedFiles.map(file => onFileRead => readData(file, onFileRead));
    const isTranslationActionsNeeded = includes(this.contentManager.translationIds, request.language);
    const fileActions = isTranslationActionsNeeded ? translationsFileActions : noTranslationsFileActions;

    return fileActions();
  }

  getEntityDescriptors(entities: Array<string>): Array<EntityDescriptor> {
    return entities.map(entity => new EntityDescriptor(entity, this.contentManager));
  }

  getEntitiesHolderKey(record: any, entityDescriptors: Array<EntityDescriptor>): string {
    let result: string = '';

    for (const entityDescriptor of entityDescriptors) {
      result += record[entityDescriptor.entity || entityDescriptor.domain] + ',';
    }

    return result;
  }

  getFinalData(results, request) {
    const dataHash = [];
    const fields = request.select.key.concat(request.select.value);
    const projection = reduce(
      fields,
      (currentProjection, field: string) => {
        currentProjection[field] = 1;

        return currentProjection;
      },
      {});

    results.forEach(result => {
      if (isEmpty(result.data)) {
        return;
      }

      const timeKey = result.timeField;
      const measureKey = result.measureField;

      const entityDescriptors = this.getEntityDescriptors(result.entityFields);

      result.data.forEach(record => {
        const holderKey = `${this.getEntitiesHolderKey(record, entityDescriptors)},${record[result.timeField]}`;

        if (!dataHash[holderKey]) {
          dataHash[holderKey] = {
            [timeKey]: record[result.timeField]
          };
          entityDescriptors.forEach(entityDescriptor => {
            if (entityDescriptor.entity) {
              dataHash[holderKey][entityDescriptor.entity] = record[entityDescriptor.entity];
              dataHash[holderKey][entityDescriptor.domain] = record[entityDescriptor.entity];
            }

            if (!entityDescriptor.entity) {
              dataHash[holderKey][entityDescriptor.domain] = record[entityDescriptor.domain];
            }
          });
          request.select.value.forEach(measure => {
            dataHash[holderKey][measure] = null;
          });
        }

        dataHash[holderKey][measureKey] = record[measureKey];
      });
    });

    const query = new Mingo.Query(request.where);
    const data = values(dataHash);
    const timeKeys = keys(timeValuesHash);
    const filteredData = query.find(data).all().map(record => {
      const resultRecord = {};
      const projectionKeys = keys(projection);

      for (const projectionKey of projectionKeys) {
        resultRecord[projectionKey] = record[projectionKey];
      }

      for (const timeKey of timeKeys) {
        if (isInteger(record[timeKey])) {
          resultRecord[timeKey] = `${timeValuesHash[timeKey][record[timeKey]]}`;
          break;
        }
      }

      return resultRecord;
    });

    return filteredData;
  }
}
