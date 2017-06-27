import { ContentManager } from './content-manager';
import { ConceptAdapter } from './adapters/concept-adapter';
import { EntityAdapter } from './adapters/entity-adapter';
import { EntitySchemaAdapter } from './adapters/entity-schema-adapter';
import { JoinsAdapter } from './adapters/joins-adapter';
import { DataPointAdapter } from './adapters/datapoint-adapter';
import { DataPointSchemaAdapter } from './adapters/datapoint-schema-adapter';
import { RequestNormalizer } from './request-normalizer';
import { IReader } from './file-readers/reader';
import { IDdfAdapter } from './adapters/adapter';
import { parallel } from 'async';
import {
  cloneDeep,
  isArray,
  isEmpty,
  isObject,
  intersection,
  flatten,
  flattenDeep,
  sortBy,
  startsWith,
  uniq
} from 'lodash';
import * as traverse from 'traverse';

const contentManager: ContentManager = new ContentManager();
const ADAPTERS = {
  concepts: ConceptAdapter,
  entities: EntityAdapter,
  entitiesSchema: EntitySchemaAdapter,
  joins: JoinsAdapter,
  datapoints: DataPointAdapter,
  datapointsSchema: DataPointSchemaAdapter
};

const isEntitySet = concept => contentManager.conceptTypeHash[concept] === 'entity_set';
const isEntityDomain = concept => contentManager.conceptTypeHash[concept] === 'entity_domain';
const isEntity = concept => isEntitySet(concept) || isEntityDomain(concept);
const getFilesToProcessing = (files: string[]) => {
  const expectedHeadersCollection = [];

  for (let file of files) {
    const expectedDataPackageResources = contentManager.dataPackage.resources.filter(resource =>
      resource.path === file).map(resource => resource.schema.fields);
    const allExpectedDataPackageFields = flattenDeep(expectedDataPackageResources).map((field: any) =>
      field.name.replace(/is--/, '')).filter(concept => isEntity(concept));
    const isDomainPresent = allExpectedDataPackageFields.filter(concept => isEntityDomain(concept)).length > 0;
    const isEntitySetPresent = allExpectedDataPackageFields.filter(concept => isEntitySet(concept)).length > 0;
    const expectedDataPackageFields = allExpectedDataPackageFields.filter(concept =>
      (isEntitySetPresent && isDomainPresent && isEntitySet(concept)) || (!isEntitySetPresent && isEntityDomain(concept)));

    expectedHeadersCollection.push(...expectedDataPackageFields);
  }

  const expectedHeaders = uniq(expectedHeadersCollection);

  contentManager.dataPointFilesToProcessing = contentManager.dataPackage.resources
    .filter(resource => {
      if (!isArray(resource.schema.primaryKey)) {
        return false;
      }

      const entityParts = resource.schema.primaryKey.filter(concept => isEntity(concept));

      return intersection(expectedHeaders, entityParts).length >= entityParts.length;
    })
    .map(resource => resource.path);
};

function postProcessing(requestParam, data) {
  if (!isArray(data)) {
    return data;
  }

  let processedData = data;

  if (requestParam.from === 'concepts') {
    processedData = data.map(record => {
      Object.keys(record).forEach(key => {
        if (isObject(record[key])) {
          record[key] = JSON.stringify(record[key]);
        }
      });

      return record;
    });
  }

  if (!isEmpty(requestParam.order_by) && isArray(requestParam.order_by)) {
    processedData = sortBy(processedData, requestParam.order_by);
  }

  return processedData;
}

export class Ddf {
  public ddfPath: string;
  public reader: IReader;

  constructor(ddfPath, reader) {
    this.ddfPath = ddfPath;
    this.reader = cloneDeep(reader);

    if (this.ddfPath[this.ddfPath.length - 1] !== '/') {
      this.ddfPath += '/';
    }
  }

  getContentManager(): ContentManager {
    return contentManager;
  }

  getDataPackage(onDataPackageLoaded: Function) {
    const dataPackageFileName = `${this.ddfPath}datapackage.json`;

    this.reader.readJSON(dataPackageFileName, (dataPackageError, dataPackageData) => {
      if (dataPackageError) {
        onDataPackageLoaded(dataPackageError);
        return;
      }

      contentManager.setDataPackage(dataPackageData);

      this.getConcepts((conceptsError, conceptsData) => {
        if (conceptsError) {
          onDataPackageLoaded(conceptsError);
          return;
        }

        const resetHashes = () => {
          contentManager.concepts = conceptsData;
          contentManager.empty();
        };
        const fillConceptHashes = () => {
          for (let currentConcept of conceptsData) {
            if (currentConcept.concept_type === 'entity_domain') {
              contentManager.domainConcepts.push(currentConcept.concept);
            }

            if (currentConcept.concept_type === 'entity_set') {
              contentManager.entitySetConcepts.push(currentConcept.concept);
              contentManager.domainHash[currentConcept.concept] = currentConcept.domain;
            }

            if (currentConcept.concept_type === 'time') {
              contentManager.timeConcepts.push(currentConcept.concept);
            }

            if (currentConcept.concept_type === 'boolean') {
              contentManager.booleanConcepts.push(currentConcept.concept);
            }

            if (currentConcept.concept_type === 'measure') {
              contentManager.measureConcepts.push(currentConcept.concept);
            }

            contentManager.conceptTypeHash[currentConcept.concept] = currentConcept.concept_type;
          }
        };
        const fillNameHash = () => {
          for (let resource of dataPackageData.resources) {
            contentManager.nameHash[resource.name] = resource.path;
          }
        };

        resetHashes();
        fillConceptHashes();
        fillNameHash();

        onDataPackageLoaded(null, contentManager.dataPackage);
      });
    });
  }

  getConcepts(onConceptsLoaded: Function) {
    const conceptFiles = uniq(
      contentManager.dataPackage.resources
        .filter(record => record.schema.primaryKey === 'concept')
        .map(record => record.path)
    );
    const actions = conceptFiles.map(file => onFileRead => {
      this.reader.readCSV(`${this.ddfPath}${file}`, (err, data) => onFileRead(err, data));
    });

    parallel(actions, (err, results) => onConceptsLoaded(err, flatten(results)));
  }

  getRelationKeysDescriptors(requestParam: any): Array<any> {
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

  getJoinProcessors(requestParam: any, relationKeysDescriptors: any[]) {
    return relationKeysDescriptors.map(relationKeyDescriptor => onJoinProcessed => {
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

  processRequest(requestParam: any, requestNormalizer: RequestNormalizer, onRequestProcessed: Function) {
    const request = cloneDeep(requestParam);
    const ddfTypeAdapter: IDdfAdapter =
      new ADAPTERS[request.from](contentManager, this.reader, this.ddfPath).addRequestNormalizer(requestNormalizer);

    ddfTypeAdapter.getNormalizedRequest(request, (normError, normRequest) => {
      if (normError) {
        onRequestProcessed(normError);
        return;
      }

      const expectedSchemaDetails = ddfTypeAdapter.getExpectedSchemaDetails(normRequest, contentManager.dataPackage);
      const expectedFiles = uniq(flattenDeep(expectedSchemaDetails.map(ddfSchemaRecord => ddfSchemaRecord.resources)))
        .map((resource: string) => contentManager.nameHash[resource]);

      ddfTypeAdapter.reader.setRecordTransformer(ddfTypeAdapter.getRecordTransformer(normRequest));

      const fileActions = ddfTypeAdapter.getFileActions(expectedFiles, request);

      parallel(fileActions, (err, results) => onRequestProcessed(
        err,
        postProcessing(requestParam, ddfTypeAdapter.getFinalData(results, normRequest)))
      );
    });
  }

  ddfRequest(requestParam: any, onDdfRequestProcessed: Function) {
    this.getDataPackage(dataPackageErr => {
      if (dataPackageErr) {
        onDdfRequestProcessed(dataPackageErr);
        return;
      }

      const requestNormalizer = new RequestNormalizer(requestParam, contentManager);
      const request = requestNormalizer.getNormalized();
      const relationKeysDescriptors = this.getRelationKeysDescriptors(request);

      parallel(this.getJoinProcessors(request, relationKeysDescriptors), (err, results: any) => {
        if (err) {
          onDdfRequestProcessed(err);
          return;
        }

        const normalRequestCondition: any = traverse(request.where);
        const files = [];

        results.forEach((result: any) => {
          normalRequestCondition.set(result.relationKeyDescriptor.path, result.condition.data);
          files.push(...result.condition.files);
        });

        request.where = normalRequestCondition.value;

        getFilesToProcessing(files);

        this.processRequest(request, requestNormalizer, (mainError, data) => {
          onDdfRequestProcessed(mainError, data);
        });
      });
    });
  }
}
