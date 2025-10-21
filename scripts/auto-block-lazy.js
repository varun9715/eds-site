/* eslint-disable import/no-cycle */
import { loadDisclaimers } from '../blocks/disclaimer/disclaimer-loader.js';

/**
 * Builds all synthetic blocks in a container element.
 */
const buildAutoBlocksLazy = (main) => {
  try {
    loadDisclaimers(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
};

export default buildAutoBlocksLazy;
