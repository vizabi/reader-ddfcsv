import {RequestNormalizer} from '../request-normalizer';
import {IReader} from '../file-readers/reader';

export interface IDdfAdapter {
  reader?: IReader;
  addRequestNormalizer(requestNormalizer: RequestNormalizer): IDdfAdapter;
  getDataPackageFilteredBySelect(request: any, dataPackageContent: any): any;
  getNormalizedRequest(requestParam: any, onRequestNormalized: Function);
  getRecordTransformer(request?: any): Function;
  getFileActions(expectedFiles: Array<any>): Array<any>;
  getFinalData(results, request: any): Array<any>
}
