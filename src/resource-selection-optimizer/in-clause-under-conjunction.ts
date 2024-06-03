import * as path from 'path';
import * as head from 'lodash.head';
import * as values from 'lodash.values';
import * as keys from 'lodash.keys';
import * as get from 'lodash.get';
import * as flattenDeep from 'lodash.flattendeep';
import * as isEmpty from 'lodash.isempty';
import * as startsWith from 'lodash.startswith';
import * as includes from 'lodash.includes';
import * as compact from 'lodash.compact';
import { DdfCsvError } from '../ddfcsv-error';
import { IDatapackage, IResourceSelectionOptimizer, IResourceRead, IBaseReaderOptions } from '../interfaces';
import { QueryFeature, featureDetectors, IQuery } from 'ddf-query-validator';

const Papa = require('papaparse');

const WHERE_KEYWORD = 'where';
const JOIN_KEYWORD = 'join';
const KEY_IN = '$in';
const KEY_NIN = '$nin';
const KEY_AND = '$and';
const KEY_OR = '$or';

const getFirstConditionClause = clause => head(values(clause));
const getFirstKey = obj => head(keys(obj));
const isOneKeyBased = obj => keys(obj).length === 1;

export class InClauseUnderConjunction implements IResourceSelectionOptimizer {
  private flow: any = {};
  private fileReader: IResourceRead;
  private datasetPath: string;
  private query: IQuery;
  private datapackage: IDatapackage;
  private conceptsLookup;

  constructor(private parent, queryParam, private options: IBaseReaderOptions) {
    this.fileReader = options.fileReader;
    this.datasetPath = options.basePath;
    this.query = queryParam;
    this.datapackage = options.datapackage;
    this.conceptsLookup = options.conceptsLookup;
  }

  isMatched(): boolean {
    this.flow.joinObject = get(this.query, JOIN_KEYWORD);

    const relatedFeatures = compact(featureDetectors.map(detector => detector(this.query, this.conceptsLookup)));

    return this.query.from === "datapoints";
    // return includes(relatedFeatures, QueryFeature.WhereClauseBasedOnConjunction) &&
    //   includes(relatedFeatures, QueryFeature.ConjunctionPartFromWhereClauseCorrespondsToJoin);
  }

  async getRecommendedFilesSet(): Promise<string[]> {
    const { debug, error, warning } = this.options.diagnostic.prepareDiagnosticFor('getRecommendedFilesSet');

    if (this.isMatched()) {
      debug('plugin matched');

      let result;
      try {
        this.collectProcessableClauses();
        this.collectEntityFilesNames();
        const data = await this.collectEntities();
        this.fillEntityValuesHash(data);
        this.getFilesGroupsQueryClause();
        result = this.getOptimalFilesGroup();
      } catch (err) {
        error('wrong data processing', err);
        return [];
      }

      debug('recommended files found', result);

      return result;
    } else {
      const message = `Plugin "InClauseUnderConjunction" is not matched!`;
      warning(message);
      throw new DdfCsvError(message, 'InClauseUnderConjunction plugin');
    }
  }

  private collectProcessableClauses(): InClauseUnderConjunction {
    const joinKeys = keys(this.flow.joinObject);

    this.flow.processableClauses = [];

    for (const joinKey of joinKeys) {
      const where = get(this.flow.joinObject, `${joinKey}.${WHERE_KEYWORD}`, {});

      if (this.singleAndField(where)) {
        this.flow.processableClauses.push(...flattenDeep(where[KEY_AND].map(el => this.getProcessableClauses(el))));
      } else if (this.singleOrField(where)) {
        this.flow.processableClauses.push(...flattenDeep(where[KEY_OR].map(el => this.getProcessableClauses(el))));
      } else {
        this.flow.processableClauses.push(...this.getProcessableClauses(where));
      }
    }

    return this;
  }

  private collectEntityFilesNames(): InClauseUnderConjunction {
    this.flow.entityFilesNames = new Set();
    this.flow.entityResources = new Set();
    this.flow.fileNameToPrimaryKeyHash = new Map();

    for (const schemaResourceRecord of this.datapackage.ddfSchema.entities) {
      for (const clause of this.flow.processableClauses) {
        const primaryKey = getFirstKey(clause);

        if (head(schemaResourceRecord.primaryKey) === primaryKey) {
          for (const resourceName of schemaResourceRecord.resources) {
            const resource = this.options.resourcesLookup.get(resourceName);

            this.flow.entityResources.add(resource);
            this.flow.entityFilesNames.add(resource.path);
            this.flow.fileNameToPrimaryKeyHash.set(resource.path, primaryKey);
          }
        }
      }
    }

    return this;
  }

  private collectEntities(): Promise<any> {
    const self = this;
    const actions = [...self.flow.entityResources].map(resource => {
      return (resource.data || (resource.data = self.parent.loadFile(resource.path, self.options)))
        .then(data => ({result: data, file: resource.path}));
    });

    return Promise.all(actions);
  }

  private fillEntityValuesHash(entitiesData): InClauseUnderConjunction {
    const getSubdomainsFromRecord = record => compact(keys(record)
      .filter(key => startsWith(key, 'is--') && (record[key] === true))
      .map(key => key.replace(/^is--/, '')));

    this.flow.entityValueToFileHash = new Map();
    this.flow.entityValueToDomainHash = new Map();

    for (const entityFileDescriptor of entitiesData) {
      for (const entityRecord of entityFileDescriptor.result.data) {
        const primaryKeyForThisFile = this.flow.fileNameToPrimaryKeyHash.get(entityFileDescriptor.file);
        const domainsForCurrentRecord = [...getSubdomainsFromRecord(entityRecord)];

        if (isEmpty(domainsForCurrentRecord)) {
          domainsForCurrentRecord.push(primaryKeyForThisFile);
        }

        const primaryKeyCellValue = entityRecord[primaryKeyForThisFile] || entityRecord[domainsForCurrentRecord[0]];

        this.flow.entityValueToDomainHash.set(primaryKeyCellValue, domainsForCurrentRecord);
        this.flow.entityValueToFileHash.set(primaryKeyCellValue, entityFileDescriptor.file);
      }
    }

    return this;
  }

  private getFilesGroupsQueryClause(): InClauseUnderConjunction {
    const getEntitiesExcept = (entityValuesToExclude: string[]): string[] => {
      const result = [];

      for (const entityKey of this.flow.entityValueToDomainHash.keys()) {
        if (!includes(entityValuesToExclude, entityKey)) {
          result.push(entityKey);
        }
      }

      return result;
    };
    const filesGroupsByClause = new Map();

    for (const clause of this.flow.processableClauses) {
      const filesGroupByClause = {
        entities: this.flow.entityFilesNames,
        datapoints: new Set(),
        concepts: new Set()
      };
      const firstConditionClause = getFirstConditionClause(clause);
      const entityValuesFromClause = firstConditionClause[KEY_IN] || getEntitiesExcept(firstConditionClause[KEY_NIN]);

      for (const entityValueFromClause of entityValuesFromClause) {
        //filesGroupByClause.entities.add(this.flow.entityValueToFileHash.get(entityValueFromClause));

        const entitiesByQuery = this.flow.entityValueToDomainHash.get(entityValueFromClause);

        for (const entityByQuery of entitiesByQuery) {
          for (const schemaResourceRecord of this.datapackage.ddfSchema.datapoints) {
            for (const resourceName of schemaResourceRecord.resources) {
              if (includes(schemaResourceRecord.primaryKey, entityByQuery)) {
                const resource = this.options.resourcesLookup.get(resourceName);
                const constraint = resource.constraints[entityByQuery];
                if ( constraint ) {
                  if (constraint.includes(entityValueFromClause)) {
                    filesGroupByClause.datapoints.add(resource.path);
                  }
                }                
                else {
                  filesGroupByClause.datapoints.add(resource.path);
                }
              }
            }
          }
        }
      }

      for (const schemaResourceRecord of this.datapackage.ddfSchema.concepts) {
        for (const resourceName of schemaResourceRecord.resources) {
          filesGroupByClause.concepts.add(this.options.resourcesLookup.get(resourceName).path);
        }
      }

      filesGroupsByClause.set(clause, filesGroupByClause);
    }

    this.flow.filesGroupsByClause = filesGroupsByClause;

    return this;
  }

  private getOptimalFilesGroup(): string[] {
    const clauseKeys = this.flow.filesGroupsByClause.keys();

    let appropriateClauseKey;
    let appropriateClauseSize;

    for (const key of clauseKeys) {
      const size = this.flow.filesGroupsByClause.get(key).datapoints.size +
        this.flow.filesGroupsByClause.get(key).entities.size +
        this.flow.filesGroupsByClause.get(key).concepts.size;

      if (!appropriateClauseKey || size < appropriateClauseSize) {
        appropriateClauseKey = key;
        appropriateClauseSize = size;
      }
    }

    if (!this.flow.filesGroupsByClause.get(appropriateClauseKey)) {
      return [];
    }

    return [
      ...Array.from(this.flow.filesGroupsByClause.get(appropriateClauseKey).concepts),
      ...Array.from(this.flow.filesGroupsByClause.get(appropriateClauseKey).entities),
      ...Array.from(this.flow.filesGroupsByClause.get(appropriateClauseKey).datapoints)
    ] as string[];
  }

  private getProcessableClauses(clause) {
    const result = [];
    const clauseKeys = keys(clause);

    for (const key of clauseKeys) {
      if (!startsWith(key, '$') && isOneKeyBased(clause[key])) {
        // attention! this functionality process only first clause
        // for example, { geo: { '$in': ['world'] } }
        // in this example { geo: { '$in': ['world'] }, foo: { '$in': ['bar', 'baz'] }  }]
        // foo: { '$in': ['bar', 'baz'] } will NOT be processed
        const conditionKey = head(keys(clause[key]));

        if (conditionKey === KEY_IN || conditionKey === KEY_NIN) {
          result.push(clause);
        }
      }
    }

    return result;
  }

  private singleAndField(clause): boolean {
    return isOneKeyBased(clause) && !!get(clause, KEY_AND);
  }

  private singleOrField(clause): boolean {
    return isOneKeyBased(clause) && !!get(clause, KEY_OR);
  }
}
