/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
import { getContentService } from './common-utils.js';

const CACHE_CONTROL_HEADER = 'max-age=5';
/**
 * Converts a string, number, or an array of those into AEM-compatible _expression array
 * @param {string|number|(string|number)[]} values
 * @returns {{ value: string }[]}
 */
const toStringFilterExpressions = (values) => {
  if (values == null) return [];
  const inputArray = Array.isArray(values) ? values : [values];
  return inputArray
    .filter(
      (item) =>
        item !== null &&
        item !== undefined &&
        (typeof item === 'string' || typeof item === 'number'),
    )
    .map((item) => ({ value: String(item).trim() }))
    .filter(({ value }) => value.length > 0);
};

/**
 * Builds a GraphQL filter object using provided filters and optional logical operator
 * @param {object} params
 * @param {object} params.filters - e.g., { disclaimer_id: ['car'], _variation: ['master'] }
 * @param {string} [params._logOp='OR']
 * @returns {object}
 */
const buildGraphQLFilter = ({ filters = {}, _logOp = 'OR' } = {}) => {
  if (typeof filters !== 'object' || !Object.keys(filters).length) return {};

  return Object.fromEntries(
    Object.entries(filters).map(([key, values]) => [
      key,
      {
        _logOp,
        _expressions: key === '_path' ? values : toStringFilterExpressions(values),
      },
    ]),
  );
};

/**
 * Fetches data from a persisted GraphQL query using GET with URL-encoded filters
 * @param {object} config
 * @param {string} config.endpointUrl - Base URL of the GraphQL endpoint
 * @param {string} config.endpointName - Endpoint folder name (e.g., 'qantas')
 * @param {string} config.operationName - Name of the persisted GraphQL query
 * @param {object} [config.stringFilters={}] - Filters as key-value pairs of strings or string arrays
 * @returns {Promise<object|null>}
 */
const fetchFromGraphQLPersistedQuery = async ({
  endpointUrl = `${getContentService()}/graphql/execute.json`,
  endpointName = 'qcom',
  operationName,
  stringFilters = {},
} = {}) => {
  let endpoint = endpointUrl;
  // This step is required to load CFMs in UE.
  if (globalThis._runmode === 'author' || globalThis._runmode === 'preview') {
    endpoint = `/${endpointUrl.split('/').filter(Boolean).slice(1).join('/')}`;
  }
  if (!endpointName || !operationName) {
    console.error('Missing required parameters: endpointName or operationName');
    return null;
  }
  const filterObject = buildGraphQLFilter({ filters: stringFilters });
  const encodedFilter = encodeURIComponent(`;/;filter=${JSON.stringify(filterObject)}`);
  const url = `${endpoint}/${endpointName}/${operationName}${encodedFilter}`;

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': CACHE_CONTROL_HEADER,
    };
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`GraphQL GET error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL response contains errors:', result.errors);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('GraphQL fetch GET failed:', error.message);
    return null;
  }
};

export { fetchFromGraphQLPersistedQuery, buildGraphQLFilter };
