import { parallel } from 'async';
import { cloneDeep, flatten } from 'lodash';
import { ContentManager } from '../content-manager';
import { IReader } from '../file-readers/reader';
import { RequestNormalizer } from '../request-normalizer';
import { IDdfAdapter } from './adapter';
import { ConceptSchemaAdapter } from './concept-schema-adapter';
import { EntitySchemaAdapter } from './entity-schema-adapter';
import { DataPointSchemaAdapter } from './datapoint-schema-adapter';

export class GeneralSchemaAdapter implements IDdfAdapter {
  public contentManager: ContentManager;
  public reader: IReader;
  public ddfPath: string;
  public requestNormalizer: RequestNormalizer;
  public request;

  private adapters: IDdfAdapter[];

  constructor(contentManager, reader, ddfPath) {
    this.contentManager = contentManager;
    this.reader = cloneDeep(reader);
    this.ddfPath = ddfPath;
    this.adapters = [
      new ConceptSchemaAdapter(contentManager, reader, ddfPath),
      new EntitySchemaAdapter(contentManager, reader, ddfPath),
      new DataPointSchemaAdapter(contentManager, reader, ddfPath)
    ];
  }

  addRequestNormalizer(requestNormalizer) {
    this.requestNormalizer = requestNormalizer;

    return this;
  }

  getExpectedSchemaDetails(request, dataPackageContent) {
    return [];
  }

  getNormalizedRequest(requestParam, onRequestNormalized) {
    this.request = requestParam;

    const actions = this.adapters.map(adapter => onAdapterProcessed => {
      adapter.getNormalizedRequest(requestParam, () => {
        adapter.getExpectedSchemaDetails(requestParam, this.contentManager.dataPackage);

        onAdapterProcessed();
      });
    });

    parallel(actions, () => {
      onRequestNormalized(null, requestParam);
    });
  }

  getRecordTransformer() {
    return record => record;
  }

  getFileActions() {
    return flatten(this.adapters.map(adapter => adapter.getFileActions([])));
  }

  getFinalData() {
    const allResults = [];

    for (let adapter of this.adapters) {
      allResults.push(adapter.getFinalData(null, this.request));
    }

    return flatten(allResults);
  }
}
