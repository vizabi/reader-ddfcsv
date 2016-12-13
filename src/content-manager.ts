export class ContentManager {
  public conceptTypeHash: any;
  public CACHE: any;
  public dataPackage: any;
  public concepts: Array<any>;
  public entities: Array<any>;
  public timeConcepts: Array<any>;
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
}
