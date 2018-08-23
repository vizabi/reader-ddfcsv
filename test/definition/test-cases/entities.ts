import {
  BASE_PATH,
  EMPTY_TRANSLATIONS_PATH,
  WS_TESTING_PATH
} from '../../common';
import {
  CONCEPT_TYPE_ENTITY_DOMAIN,
  CONCEPT_TYPE_ENTITY_SET,
  isEntityDomainOrSet,
  RESERVED_CONCEPT,
  RESERVED_CONCEPT_TYPE,
  RESERVED_DOMAIN,
  RESERVED_DRILL_UP
} from 'ddf-query-validator';

import * as map from 'lodash.map';
import * as flatMap from 'lodash.flatmap';
import * as isNil from 'lodash.isnil';

const datasetsConfig = {
  [ WS_TESTING_PATH ]: { master: [ 'HEAD' ] },
  default: { dataset: EMPTY_TRANSLATIONS_PATH, branch: 'master', commit: 'HEAD' }
};
const ALL_OPERATORS: string[] = [ null, '.', '.is--' ];
const ALL_CONCEPTS: string[] = [ '', ' ', RESERVED_CONCEPT, RESERVED_CONCEPT_TYPE, RESERVED_DOMAIN, RESERVED_DRILL_UP, 'company', 'english_speaking', 'company_scale', 'name', 'anno', 'lines_of_code', 'region', 'country', 'latitude', 'longitude', 'full_name_changed', 'project', 'domain', 'additional_column', 'meeting_style', 'popular_appeal', 'methodology' ];
const ALL_ENTITY_SETS_AND_DOMAINS: string[] = [ 'company', 'english_speaking', 'company_scale', 'region', 'project' ];

export const initData = { path: BASE_PATH, datasetsConfig };
export const testsDescriptors = {};

ALL_ENTITY_SETS_AND_DOMAINS.forEach((entitySetOrDomain: string) => {
  const BINARY_OPERATORS = [ ...flatMap(ALL_CONCEPTS, (parent: string) => map(ALL_CONCEPTS, (child) => [ parent, child ])) ];
  const UNARY_OPERATORS = [ ...ALL_CONCEPTS ];

  const description = `Autogenerated tests for ${entitySetOrDomain}`;

  if (!testsDescriptors[description]) {
    testsDescriptors[description] = [];
  }

  ALL_OPERATORS.forEach((operator: string) => {
    const CONCEPTS_CLAUSE: any[] = isNil(operator) ? UNARY_OPERATORS : map([ ...BINARY_OPERATORS ], (args: string[]) => args.join(operator));

    CONCEPTS_CLAUSE.forEach((clause: string) => {
      testsDescriptors[description].push({
        itTitle: `should be fine for ${clause}`,
        query: {
          from: 'entities',
          dataset: WS_TESTING_PATH,
          select: { key: [ entitySetOrDomain ] },
          where: {
            [ clause ]: true
          }
        }});
    });
  });
});
