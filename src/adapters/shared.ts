export function getResourcesFilteredBy(dataPackage, selectionCriteria) {
  return dataPackage.resources.filter(record => selectionCriteria(dataPackage, record));
}
