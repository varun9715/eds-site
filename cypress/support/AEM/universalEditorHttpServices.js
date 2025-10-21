/* eslint-disable class-methods-use-this */
const authorUrl = Cypress.env('authorUrl');
const universalEditorUrl = Cypress.env('universalEditorUrl');
class UniversalEditorHTTPServices {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.edsHeaders = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
    this.connections = [
      {
        name: 'aemconnection',
        protocol: 'xwalk',
        uri: authorUrl,
      },
    ];
  }

  // eslint-disable-next-line consistent-return
  add(
    blockName,
    pageParentPath,
    pageLabel,
    configurationBody,
    blockProperties,
    resourceType = 'block',
    parentResourceType = 'default',
    resourceId = null,
  ) {
    const base = `urn:aemconnection:${pageParentPath}/${pageLabel}`;
    let resourcePath = '';
    if (parentResourceType === 'default') {
      switch (resourceType) {
        case 'section':
        case 'header-section':
          resourcePath = `${base}/jcr:content/root`;
          break;
        case 'child':
          resourcePath = resourceId
            ? `${base}/jcr:content/root/section/block/${resourceId}`
            : `${base}/jcr:content/root/section/block/`;
          break;
        case 'block':
        default:
          resourcePath = resourceId
            ? `${base}/jcr:content/root/section/${resourceId}`
            : `${base}/jcr:content/root/section`;
      }

      return this.makeAddRequest(resourcePath, configurationBody).then(
        (blockResourceId) => {
          cy.wrap(blockResourceId).as('blockResourceId');
          if (blockProperties === '') {
            cy.log(`Block ${blockName} has no properties to configure`);
          } else {
            const patchConfigBody = blockProperties
              ? this.buildPatchPayload(blockProperties)
              : [];

            this.patch(
              blockName,
              pageParentPath,
              pageLabel,
              patchConfigBody,
              resourceType,
              blockResourceId,
            );
            cy.log(
              `Block ${blockName} configured successfully with ID: ${blockResourceId}`,
            );
          }
        },
      );
    }
    if (parentResourceType === 'inside-section') {
      return cy.get('@blockResourceId').then((blockResourceId) => {
        if (resourceType === 'block') {
          resourcePath = `${base}/jcr:content/root/${blockResourceId}`;
        }
        if (resourceType === 'child') {
          resourcePath = `${base}/jcr:content/root/${blockResourceId}/block/item`;
        }
        return this.makeAddRequest(resourcePath, configurationBody).then(
          (newBlockResourceId) => {
            const patchConfigBody = blockProperties
              ? this.buildPatchPayload(blockProperties)
              : [];

            this.patch(
              blockName,
              pageParentPath,
              pageLabel,
              patchConfigBody,
              resourceType,
              newBlockResourceId,
              blockResourceId,
            );
            cy.log(
              `Block ${blockName} configured successfully with ID: ${blockResourceId}`,
            );
          },
        );
      });
    }
  }

  patch(
    blockName,
    pageParentPath,
    pageLabel,
    configurationBody,
    resourceType,
    resourceId,
    sectionResourceId,
  ) {
    const base = `urn:aemconnection:${pageParentPath}/${pageLabel}`;
    let resourcePath = '';
    switch (resourceType) {
      case 'page':
        resourcePath = `${base}/jcr:content`;
        break;
      case 'section':
      case 'header-section':
        resourcePath = `${base}/jcr:content/root/${resourceId || 'section'}`;
        break;

      case 'child':
        resourcePath = `${base}/jcr:content/root/${sectionResourceId || 'section'}/block/${resourceId || 'item'}`;
        break;
      case 'block':
      default: // 'block' or any other type
        resourcePath = `${base}/jcr:content/root/${sectionResourceId || 'section'}/${resourceId || 'block'}`;
    }
    const patchRequest = {
      url: `${universalEditorUrl}/patch`,
      method: 'POST',
      headers: this.edsHeaders,
      body: {
        connections: this.connections,
        target: {
          resource: resourcePath,
          type: 'component',
          prop: '',
        },
        patch: configurationBody,
      },
    };
    cy.log(`resourcePath in patch: ${resourcePath}`);
    cy.request(patchRequest).then((response) => {
      if (response.status === 200 || response.status === 201) {
        cy.log(`Block ${blockName} updated successfully.`);
      } else {
        cy.log(`Error in updating ${blockName} block.`);
      }
      expect(response.status).to.match(/20[01]/g);
    });
  }

  details(type, pageParentPath, pageLabel, blockId = '') {
    const resourcePaths = {
      section: `urn:aemconnection:${pageParentPath}/${pageLabel}/jcr:content/root/section`,
      block: `urn:aemconnection:${pageParentPath}/${pageLabel}/jcr:content/root/section/block`,
      childBlock: `urn:aemconnection:${pageParentPath}/${pageLabel}/jcr:content/root/section/block${blockId}/item`,
    };
    if (!resourcePaths[type]) {
      throw new Error(
        `Invalid type: ${type}. Expected 'section', 'block', or 'childBlock'.`,
      );
    }
    const detailsRequest = {
      url: `${universalEditorUrl}/details`,
      method: 'POST',
      headers: this.edsHeaders,
      body: {
        connections: this.connections,
        target: {
          resource: resourcePaths[type],
          type: type === 'section' ? 'container' : 'component',
          prop: '',
        },
      },
    };
    return cy.request(detailsRequest).then((response) => {
      cy.wrap(response)
        .its('status')
        .should('match', /20[01]/);
      return cy.wrap(response.body);
    });
  }

  publish(blockName, pageParentPath, pageLabel) {
    const publishRequest = {
      url: `${universalEditorUrl}/publish`,
      method: 'POST',
      headers: this.edsHeaders,
      body: {
        connections: this.connections,
        resources: [
          {
            id: `urn:aemconnection:${pageParentPath}/${pageLabel}`,
            required: false,
            role: 'page',
            description: pageLabel,
            references: [],
            status: 'published',
          },
        ],
        tier: 'publish',
      },
    };
    cy.request(publishRequest).then((response) => {
      if (response.status === 200 || response.status === 201) {
        cy.log(`Block ${blockName} published successfully.`);
      } else {
        cy.log(`Error in publishing ${blockName} block.`);
      }
      expect(response.status).to.match(/20[01]/g);
    });
  }

  buildPatchPayload(blockPropeties) {
    return Object.entries(blockPropeties).map(([path, value]) => ({
      op: 'replace',
      path: `/${path}`,
      value,
    }));
  }

  // eslint-disable-next-line consistent-return

  makeAddRequest(resourcePath, configurationBody) {
    const addRequest = {
      url: `${universalEditorUrl}/add`,
      method: 'POST',
      headers: this.edsHeaders,
      body: {
        connections: this.connections,
        target: {
          container: {
            resource: resourcePath,
            type: 'container',
            prop: '',
          },
        },
        content: configurationBody,
      },
    };
    return cy.request(addRequest).then((response) => {
      expect(response.status).to.match(/20[01]/g);
      const fullPath = response.body.resource;
      const blockResourceId = fullPath.split('/').pop();
      return blockResourceId;
    });
  }
}
export default UniversalEditorHTTPServices;
