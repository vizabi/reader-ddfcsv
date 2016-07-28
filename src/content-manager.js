export class ContentManager {
  constructor() {
    this.conceptTypeHash = {};

    this.CACHE = {
      FILE_CACHED: {},
      FILE_REQUESTED: {}
    };

    this.index = null;
    this.concepts = null;
    this.entities = null;
  }

  reset() {
    this.index = null;
    this.concepts = null;
    this.entities = null;
    this.CACHE.FILE_CACHED = {};
    this.CACHE.FILE_REQUESTED = {};
  }
}
