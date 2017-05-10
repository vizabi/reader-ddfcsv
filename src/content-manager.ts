import { isArray } from 'lodash';

export class ContentManager {
  public conceptTypeHash: any;
  public CACHE: any;
  public dataPackage: any;
  public translationIds: string[] = [];
  public concepts: any[];
  public entities: any[];
  public timeConcepts: any[];
  public booleanConcepts: any[];
  public domainConcepts: any[];
  public entitySetConcepts: any[];
  public measureConcepts: any[];
  public domainHash: any;

  constructor() {
    this.conceptTypeHash = {};

    this.CACHE = {
      FILE_CACHED: {},
      FILE_REQUESTED: {}
    };

    this.concepts = null;
    this.entities = null;
  }

  reset() {
    this.concepts = null;
    this.entities = null;
    this.CACHE.FILE_CACHED = {};
    this.CACHE.FILE_REQUESTED = {};
  }

  public setDataPackage(dataPackageData) {
    this.dataPackage = dataPackageData;

    if (isArray(this.dataPackage.translations)) {
      this.translationIds = this.dataPackage.translations.map(translation => translation.id);
    }
  }
}
