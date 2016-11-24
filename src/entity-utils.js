import parallel from 'async-es/parallel';
import whilst from 'async-es/whilst';

import * as Mingo from 'mingo';

import cloneDeep from 'lodash/cloneDeep';
import head from 'lodash/head';
import flatten from 'lodash/flatten';
import includes from 'lodash/includes';
import isBoolean from 'lodash/isBoolean';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import split from 'lodash/split';
import uniq from 'lodash/uniq';

const traverse = require('traverse');

export class EntityUtils {

  /* eslint-disable max-params */

  constructor(contentManager, reader, ddfPath, condition) {
    this.contentManager = contentManager;
    this.reader = reader;
    this.ddfPath = ddfPath;
    this.condition = condition;
  }

  /* eslint-enable max-params */

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

  /* eslint-disable no-invalid-this */

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

  /* eslint-enable no-invalid-this */

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
