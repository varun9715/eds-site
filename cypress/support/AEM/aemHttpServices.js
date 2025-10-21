/* eslint-disable no-shadow */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
const username = Cypress.env('AEM_USERNAME');
const password = Cypress.env('AEM_PASSWORD');

const headers = {
  'User-Agent': 'qantas-ui-tests ', // need to override user agent as cypress' user agent is being identified as a bot. And hence being blocked out by AEM.
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
};

const url = Cypress.env('authorUrl');

class AEMHTTPServices {
  constructor(pageLabel, pageTitle, pageTemplate, pageParentPath) {
    this.pageLabel = pageLabel;
    this.pageTitle = pageTitle;
    this.pageTemplate = pageTemplate;
    this.pageParentPath = pageParentPath;
  }

  createPage() {
    const createPageRequest = {
      url: `${url}/bin/wcmcommand`,
      method: 'POST',
      headers,
      form: true,
      body: {
        status: 'browser',
        cmd: 'createPage',
        label: this.pageLabel,
        title: this.pageTitle,
        parentPath: this.pageParentPath,
        template: this.pageTemplate,
      },
    };

    cy.request(createPageRequest, { log: false }).then((response) => {
      expect(response.status).to.eql(200);
    });
    return this;
  }

  configureWidget(widgetName, dropZone, configurationBody) {
    const configureWidgetRequest = {
      url: `${url}${this.pageParentPath}/${this.pageLabel}/jcr:content/${dropZone}/${widgetName}`,
      method: 'POST',
      headers,
      body: configurationBody,
    };

    cy.request(configureWidgetRequest).then((response) => {
      if (response.status === 200 || response.status === 201) {
        cy.log(`Widget ${widgetName} configured successfully.`);
      } else {
        cy.log(`Error in configuring Widget ${widgetName}.`);
      }
      expect(response.status).to.match(/20[01]/g);
    });
    return this;
  }

  authorComponentProperties(component, configurationBody) {
    const configureComponentProps = {
      url: `${url}${this.pageParentPath}/${this.pageLabel}/jcr:content/${component}`,
      method: 'POST',
      headers,
      body: configurationBody,
    };

    cy.request(configureComponentProps).then((response) => {
      if (response.status === 200 || response.status === 201) {
        cy.log(`Component ${component} configured successfully.`);
      } else {
        cy.log(`Error in configuring component ${component}.`);
      }
      expect(response.status).to.match(/20[01]/g);
    });
    return this;
  }

  publishPage() {
    cy.log(`the published page is going to be ${this.pageParentPath}/${this.pageLabel}`);
    const publishPageRequest = {
      url: `${url}/bin/replicate`,
      method: 'POST',
      headers,
      body: {
        cmd: 'Activate',
        path: `${this.pageParentPath}/${this.pageLabel}`,
      },
    };
    cy.request(publishPageRequest).then((response) => {
      if (response.status === 200 || response.status === 201) {
        cy.log('Page published successfully.');
      } else {
        cy.log('There was an error in publishing the page.');
      }
      expect(response.status).to.match(/20[01]/g);
    });
    return this;
  }

  unpublishPage() {
    const unpublishPageRequest = {
      url: `${url}/bin/replicate`,
      method: 'POST',
      headers,
      body: {
        cmd: 'Deactivate',
        path: `${this.pageParentPath}/${this.pageLabel}`,
      },
    };
    cy.request(unpublishPageRequest)
      .then((response) => {
        expect(response.status).to.eql(200);
      })
      .then(this.waitForPageToBeUnpublished.bind(this));
    return this;
  }

  login() {
    const loginRequest = {
      url: `${url}/libs/granite/core/content/login.html/j_security_check`,
      method: 'POST',
      headers,
      form: true,
      body: {
        j_username: username,
        j_password: password,
      },
    };
    cy.request(loginRequest).then((response) => {
      expect(response.status).to.eql(200);
    });
    return this;
  }

  deletePage() {
    const deletePageRequest = {
      url: `${url}/bin/wcmcommand`,
      method: 'POST',
      headers,
      form: true,
      body: {
        cmd: 'deletePage',
        path: `${this.pageParentPath}/${this.pageLabel}`,
        force: 'true',
      },
    };
    cy.request(deletePageRequest)
      .then((response) => {
        expect(response.status).to.eql(200);
      })
      .then(this.waitForPageDeletion.bind(this));
    return this;
  }

  waitForPageDeletion() {
    const MAX_RETRIES = 20; // 10 times
    const POLLING_TIME = 6000; // 6 seconds
    const { pageLabel } = this;
    function verifyPageIsDeletedInAuthor(url, count) {
      cy.request({
        url: `${Cypress.env('authorURL')}/sites.html/content/qantas/au/en/${pageLabel}`,
        method: 'GET',
        headers,
        failOnStatusCode: false,
      }).then(async (response) => {
        if (response.status === 200) {
          if (count === MAX_RETRIES) {
            throw new Error(
              `Reached maximum ${MAX_RETRIES} retries. The ${pageLabel} page seems not yet deleted.`,
            );
          }
          await new Promise((resolve) => {
            setTimeout(resolve, POLLING_TIME);
          });
          verifyPageIsDeletedInAuthor(url, ++count);
        } else {
          cy.log(
            `The ${pageLabel} page was deleted. Response code recieved was: ${response.status}`,
          );
        }
      });
    }
    verifyPageIsDeletedInAuthor(url, 1);
  }

  waitForPageToBeUnpublished() {
    const MAX_RETRIES = 20; // 10 times
    const POLLING_TIME = 6000; // 6 seconds
    const { pageLabel } = this;
    function verifyPageIsUnpublished(url, count) {
      cy.request({
        url: `${Cypress.env('publisherURL')}/au/en/${pageLabel}.html`,
        method: 'GET',
        headers,
        failOnStatusCode: false,
      }).then(async (response) => {
        if (response.status === 200) {
          if (count === MAX_RETRIES) {
            throw new Error(
              `Reached maximum ${MAX_RETRIES} retries. The ${pageLabel} page seems not yet unpublished.`,
            );
          }
          await new Promise((resolve) => {
            setTimeout(resolve, POLLING_TIME);
          });
          verifyPageIsUnpublished(url, ++count);
        } else {
          cy.log(
            `The ${pageLabel} page was unpublished. Response code recieved was: ${response.status}`,
          );
        }
      });
    }
    verifyPageIsUnpublished(url, 1);
  }

  pubLoginWithIP(status) {
    const statCode = status === 'with200STATUS' ? 200 : 404;
    const loginRequest = {
      url: `${Cypress.env('AUTHOR_ACL_URL')}/libs/granite/core/content/login.html/j_security_check`,
      method: 'POST',
      headers,
      form: true,
      failOnStatusCode: false,
      body: {
        j_username: username,
        j_password: password,
      },
    };
    cy.request(loginRequest).then((response) => {
      expect(response.status).to.eql(statCode);
    });

    return this;
  }
}

export default AEMHTTPServices;
