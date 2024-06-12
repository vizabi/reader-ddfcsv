import * as head from 'lodash.head';
import * as values from 'lodash.values';
import * as keys from 'lodash.keys';
import * as get from 'lodash.get';
import * as isEmpty from 'lodash.isempty';
import * as startsWith from 'lodash.startswith';
import * as includes from 'lodash.includes';
import * as compact from 'lodash.compact';
import { DdfCsvError } from '../ddfcsv-error';
import { IDatapackage, IResourceSelectionOptimizer, IResourceRead, IBaseReaderOptions } from '../interfaces';
import { QueryFeature, featureDetectors, IQuery } from 'ddf-query-validator';

const WHERE_KEYWORD = 'where';
const JOIN_KEYWORD = 'join';
const KEY_IN = '$in';
const KEY_NIN = '$nin';
const KEY_AND = '$and';
const KEY_OR = '$or';

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

    return this.query.from === "datapoints" && this.flow.joinObject;
  }

  async getRecommendedFilesSet(): Promise<string[]> {
    const { debug, error, warning } = this.options.diagnostic.prepareDiagnosticFor('getRecommendedFilesSet');

    if (this.isMatched()) {
      debug('plugin matched');

      let result;
      try {
        this.flow.processableClauses = await this.collectProcessableClauses();
        if (!this.flow.processableClauses) return [];
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

  private collectProcessableClauses(): Promise<any> {
    const joinKeys = keys(this.flow.joinObject).filter(
      key => ["entity_domain", "entity_set"].includes(this.options.conceptsLookup.get(key.slice(1))?.concept_type));
    if (!joinKeys.length) return Promise.resolve(false);

    return Promise.all(joinKeys.map(joinKey => {
      const key = this.flow.joinObject[joinKey].key;
      const where = get(this.flow.joinObject, `${joinKey}.${WHERE_KEYWORD}`, {});

      return this.parent.queryData({
        select: { key: [key] },
        where,
        from: this.options.conceptsLookup.has(key) ? 'entities' : 'concepts'
      }, Object.assign({ joinID: joinKey }, this.options))
        .then(result => ({
          key,
          entities: new Set(result.map(row => row[ key ]))
        }));
    }));

  }

  private collectEntityFilesNames(): InClauseUnderConjunction {
    this.flow.entityFilesNames = new Set();
    this.flow.entityResources = new Set();
    this.flow.fileNameToPrimaryKeyHash = new Map();

    for (const schemaResourceRecord of this.datapackage.ddfSchema.entities) {
      for (const clause of this.flow.processableClauses) {
        const key = clause.key;

        if (head(schemaResourceRecord.primaryKey) === key) {
          for (const resourceName of schemaResourceRecord.resources) {
            const resource = this.options.resourcesLookup.get(resourceName);

            this.flow.entityResources.add(resource);
            this.flow.entityFilesNames.add(resource.path);
            this.flow.fileNameToPrimaryKeyHash.set(resource.path, key);
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
    const filesGroupsByClause = new Map();

    for (const clause of this.flow.processableClauses) {
      const filesGroupByClause = {
        datapoints: new Set()
      };

      for (const entityValueFromClause of clause.entities) {

        const entitiesByQuery = this.flow.entityValueToDomainHash.get(entityValueFromClause);

        for (const entityByQuery of entitiesByQuery) {
          for (const schemaResourceRecord of this.datapackage.ddfSchema.datapoints) {
            for (const resourceName of schemaResourceRecord.resources) {
              if (includes(schemaResourceRecord.primaryKey, entityByQuery)) {
                const resource = this.options.resourcesLookup.get(resourceName);
                const constraint = resource.constraints?.[entityByQuery];
                if ( constraint ) {
                  if (constraint.includes(entityValueFromClause)) {
                    filesGroupByClause.datapoints.add(resource.path);
                  }
                } else {
                  filesGroupByClause.datapoints.add(resource.path);
                }
              }
            }
          }
        }
      }

      filesGroupsByClause.set(clause.key, filesGroupByClause);
    }

    this.flow.filesGroupsByClause = filesGroupsByClause;

    return this;
  }

  private getOptimalFilesGroup(): string[] {

    const entities = this.flow.entityFilesNames;

    const concepts = new Set();
    for (const schemaResourceRecord of this.datapackage.ddfSchema.concepts) {
      for (const resourceName of schemaResourceRecord.resources) {
        concepts.add(this.options.resourcesLookup.get(resourceName).path);
      }
    }

    const clauseKeys = this.flow.filesGroupsByClause.keys();
    let datapoints = Array.from(this.flow.filesGroupsByClause.get(clauseKeys.next().value).datapoints);

    for (const key of clauseKeys) {
      datapoints = this.intersectArray(datapoints, Array.from(this.flow.filesGroupsByClause.get(key).datapoints));
    }

    return [...Array.from(concepts), ...Array.from(entities)].concat(datapoints) as string[];
  }


  private intersectArray(array1, array2) {
    return array1.filter(value => array2.includes(value));
  }

}
