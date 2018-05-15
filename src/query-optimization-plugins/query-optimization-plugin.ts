export interface IQueryOptimizationPlugin {
  isMatched(): boolean;

  getOptimalFilesSet(): Promise<string[]>;
}
