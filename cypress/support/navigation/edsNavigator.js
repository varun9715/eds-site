/* eslint-disable consistent-return */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable class-methods-use-this */
const edsUrl = Cypress.env('edsUrl');

class EdsNavigator {
  visitHomePage(countryCode = 'au', languageCode = 'en') {
    cy.visit(`${edsUrl}/${languageCode}-${countryCode}`);
  }

  visit(pageLabel) {
    const fullEdsUrl = `${edsUrl}/en-au/cypress/${pageLabel}`;
    this.verifyIfThePageIsReady(fullEdsUrl).then(() => {
      this.verifyIfPageIsVisitable(fullEdsUrl);

      cy.reload(true); // Reload the page to ensure it's loaded - avoids intermittent 404
    });
    return this;
  }

  verifyIfThePageIsReady(fullEdsUrl) {
    const MAX_RETRIES = 30; // 30 retries
    const POLLING_TIME = 500; // 0.5 seconds per retry
    const startTime = Date.now();

    function verifyPage(count) {
      return cy
        .request({
          url: fullEdsUrl,
          method: 'GET',
          failOnStatusCode: false,
          headers: {
            'User-Agent': 'qantas-ui-tests ',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        })
        .then((response) => {
          if (response.status !== 200) {
            if (count >= MAX_RETRIES) {
              throw new Error(
                `Reached maximum retry. The published page ${fullEdsUrl} is not found.`,
              );
            }
            return cy.wait(POLLING_TIME).then(() => verifyPage(count + 1));
          }
          const elapsedTime = (Date.now() - startTime) / 1000;
          cy.task(
            'log',
            `The page is now ready to accept traffic when using cy.request(). It took "${elapsedTime}" seconds for the page to come up`,
          );
          return cy.wrap(true);
        });
    }

    return verifyPage(1);
  }

  verifyIfPageIsVisitable(fullEdsUrl) {
    const MAX_RETRIES = 5; // 5 retries
    const POLLING_TIME = 1000; // 1 second per retry

    function tryVisit(count) {
      cy.visit(fullEdsUrl, { failOnStatusCode: false }).then((response) => {
        if (response.status === 404 && count < MAX_RETRIES) {
          cy.task('log', `Retrying visit to ${fullEdsUrl} (${count}/${MAX_RETRIES})`);
          return cy.wait(POLLING_TIME).then(() => tryVisit(count + 1));
        }
        if (response.status === 404) {
          throw new Error(`Page ${fullEdsUrl} still returns 404 after multiple attempts`);
        }
      });
    }

    tryVisit(1);
  }
}
export default EdsNavigator;
