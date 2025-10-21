/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
const fetchRequest = require('node-fetch');
require('dotenv').config();

const THIRTY_MINUTE_TIMEOUT = 30 * 60 * 1000;
const NINETY_MINUTE_TIMEOUT = 90 * 60 * 1000;
const THIRTY_SECOND_INTERVAL = 30000;
const controller = new AbortController();

const env = process.env.CYPRESS_ENV || 'dev';

const totalTimeout = env === 'prod' ? NINETY_MINUTE_TIMEOUT : THIRTY_MINUTE_TIMEOUT;

class AEMStatusService {
  constructor(edsUrl) {
    this.edsUrl = `${edsUrl}/en-au`;
  }

  async waitUntilHomepageAvailable() {
    let homepageUnavailable = true;
    let count = 1;

    console.log('============== Homepage Status ==============');

    do {
      try {
        await this.#homepageIsAvailable();
        console.log('Status: REACHABLE');
        console.log(`Homepage "${this.edsUrl}" is reachable. Continuing with the tests`);
        homepageUnavailable = false;
      } catch (err) {
        console.log('Status: NOT REACHABLE');
        console.log(`Error: ${err.message}`);
        await this.#startTimeout();
        count++;
      }
    } while (homepageUnavailable && count * THIRTY_SECOND_INTERVAL <= totalTimeout);

    if (homepageUnavailable) {
      throw new Error(
        `\n Reached maximum retries. \n Homepage "${this.edsUrl}" is not reachable.`,
      );
    }
  }

  async #startTimeout() {
    await new Promise((resolve) => {
      setTimeout(resolve, THIRTY_SECOND_INTERVAL);
    });
  }

  async #homepageIsAvailable() {
    const timeout = setTimeout(() => {
      controller.abort();
    }, THIRTY_SECOND_INTERVAL);
    let result;

    try {
      const akamaiHeader = process.env.AKAMAIHEADER;
      const akamaiPassword = process.env.AKAMAIHEADERPASSWORD;
      const headers =
        akamaiHeader && akamaiPassword ? { [akamaiHeader]: akamaiPassword } : {};

      result = await fetchRequest(`${this.edsUrl}`, {
        method: 'GET',
        signal: controller.signal,
        headers,
      });
    } catch (error) {
      console.error('Error fetching request:', error);
    } finally {
      clearTimeout(timeout);
    }

    if (!result.ok) {
      throw new Error(
        `Homepage "${this.edsUrl}" is not reachable with http status ${result.status}`,
      );
    }
  }
}

module.exports = { AEMStatusService };
