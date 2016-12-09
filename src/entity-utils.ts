import {parallel, whilst} from 'async';
import {
  cloneDeep,
  head,
  flatten,
  includes,
  isBoolean,
  isEmpty,
  isEqual,
  split,
  uniq
} from 'lodash';
import {ContentManager} from './content-manager';
import {IReader} from './file-readers/reader';
import * as traverse from 'traverse';

const Mingo = require('mingo');

export class EntityUtils {
  public contentManager: ContentManager;
  public reader: IReader;
  public ddfPath: string;
  public condition: any;

  constructor(contentManager, reader, ddfPath, condition) {
    this.contentManager = contentManager;
    this.reader = reader;
    this.ddfPath = ddfPath;
    this.condition = condition;
  }

  getConditionBranchActions(expectedFiles, conditionDescriptor) {
    const conditionBranchActions = [];

    conditionBranchActions.push(onConditionPartProcessed => {
      const fileActions = expectedFiles.map(file => onFileRead => {
        this.reader.readCSV(`${this.ddfPath}${file}`, onFileRead);
      });

      parallel(fileActions, (fileError, fileResults) => {
        const aggregatedFileData = flatten(fileResults);
        const queryByEntitiesFiles = new Mingo.Query({[conditionDescriptor.criteria]: conditionDescriptor.value});
        const expectedEntitiesData = queryByEntitiesFiles.find(aggregatedFileData).all();

        if (!isEmpty(expectedEntitiesData)) {
          const firstRecord = head(expectedEntitiesData);
          const key = head(Object.keys(firstRecord));
          const expectedData = expectedEntitiesData.map(record => record[key]);

          conditionDescriptor.keyForCondition = '$or';
          conditionDescriptor.valueForCondition = [
            {[key]: {$in: expectedData}},
            {[conditionDescriptor.domain]: {$in: expectedData}}
          ];
        }

        onConditionPartProcessed(fileError);
      });
    });

    return conditionBranchActions;
  }

  getConditionsDescriptors(conditionToTraverse) {
    const expectedConditionsDescriptors = [];

    function processConditionBranch() {
      if (includes(this.key, '.') && this.isLeaf && isBoolean(this.node)) {
        const [domain, criteria] = split(this.key, '.');
        const value = this.node ? 'TRUE' : 'FALSE';

        expectedConditionsDescriptors.push({domain, criteria, value, path: this.path});
      }
    }

    conditionToTraverse.forEach(processConditionBranch);

    return expectedConditionsDescriptors;
  }

  conditionPostProcess(conditionToTraverse, conditionsDescriptors) {
    function processConditionBranch() {
      if (includes(this.key, '.') && this.isLeaf && isBoolean(this.node)) {
        const {keyForCondition, valueForCondition} = conditionsDescriptors.find(expectedConditionDescriptor =>
          isEqual(expectedConditionDescriptor.path, this.path));

        this.path[this.path.length - 1] = keyForCondition;
        conditionToTraverse.set(this.path, valueForCondition);

        this.remove();
      }
    }

    conditionToTraverse.forEach(processConditionBranch);
  }

  transformConditionByDomain(onConditionTransformed) {
    const condition = cloneDeep(this.condition);
    const conditionToTraverse = traverse(condition);
    const conditionsDescriptors = this.getConditionsDescriptors(conditionToTraverse);

    let count = 0;

    whilst(
      () => count < conditionsDescriptors.length,
      onBranchReady => {
        const conditionDescriptor = conditionsDescriptors[count++];
        const expectedEntities = this.contentManager.concepts
          .filter(concept => concept.domain === conditionDescriptor.domain)
          .map(concept => concept.concept);
        const expectedFiles = uniq(
          this.contentManager.dataPackage.resources
            .filter(dataPackageRecord => includes(expectedEntities, dataPackageRecord.schema.primaryKey))
            .map(dataPackageRecord => dataPackageRecord.path)
        );

        parallel(this.getConditionBranchActions(expectedFiles, conditionDescriptor), err => onBranchReady(err));
      },
      err => {
        this.conditionPostProcess(conditionToTraverse, conditionsDescriptors);

        onConditionTransformed(err, condition);
      }
    );
  }
}
