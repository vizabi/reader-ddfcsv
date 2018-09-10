import {
  RESERVED_CONCEPT,
  RESERVED_CONCEPT_TYPE,
  RESERVED_DOMAIN,
  RESERVED_DRILL_UP
} from 'ddf-query-validator';
import { BASE_PATH, EMPTY_TRANSLATIONS_PATH, WS_TESTING_PATH } from '../../common';

const ALL_CONCEPTS: string[] = [ '', ' ', RESERVED_CONCEPT, RESERVED_CONCEPT_TYPE, RESERVED_DOMAIN, RESERVED_DRILL_UP, 'company', 'english_speaking', 'company_scale', 'name', 'anno', 'lines_of_code', 'region', 'country', 'latitude', 'longitude', 'full_name_changed', 'project', 'additional_column', 'meeting_style', 'popular_appeal', 'methodology' ];

const datasetsConfig = {
  [ WS_TESTING_PATH ]: { master: [ 'HEAD' ] },
  default: { dataset: EMPTY_TRANSLATIONS_PATH, branch: 'master', commit: 'HEAD' }
};

export const description = 'Autogenerated tests for concepts';
export const initData = { path: BASE_PATH, datasetsConfig };
export const testsDescriptors = {
  [description]: ALL_CONCEPTS.map((concept: string) => ({
    itTitle: `should be fine for concept '${concept}'`,
    query: {
      from: 'concepts',
      dataset: WS_TESTING_PATH,
      select: {key: ['concept']},
      where: {
        concept
      }
    }
  }))
};
