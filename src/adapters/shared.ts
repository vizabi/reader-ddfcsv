import { intersection, includes, isEmpty } from 'lodash';

export const getSchemaDetailsByKeyValue = (request: any, dataPackageContent: any, type: string): any[] => {
  return dataPackageContent.ddfSchema[type].filter(resource => {
    const hasKey = intersection(request.select.key, resource.primaryKey).length === request.select.key.length &&
      request.select.key.length === resource.primaryKey.length;
    const hasValue = includes(request.select.value, resource.value);

    return hasKey && hasValue;
  });
};

export const getSchemaDetailsByKey = (request: any, dataPackageContent: any, type: string): any[] => {
  return dataPackageContent.ddfSchema[type].filter(resource => {
    const key = request.key || request.select.key;

    return !isEmpty(intersection(key, resource.primaryKey));
  });
};
