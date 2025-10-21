import AEMTestManager from '../../support/AEM/AEMTestManager.js';
import Footer from '../../support/pages/blocks/Footer.js';

import { Tags } from '../../support/tagList.js';

let aemManager;
describe('Footer Test', () => {
  beforeEach(() => {
    AEMTestManager.setup().then((instance) => {
      aemManager = instance;
    });
  });

  afterEach(() => {
    aemManager.teardown();
  });

  it('Verify footer components on Desktop', { tags: [Tags.DEV, Tags.DESKTOP] }, () => {
    // Publishing the page for Footer Section
    aemManager.publishPage();
    aemManager.visitPage();
    // Perform assertions to verify the Footer Section
    Footer.verifyFooterIsDisplayed()
      .verifyFooterLogoIsDisplayed()
      .verifyBackToTopLink()
      .verifyConnectWithUsDisplayed()
      .verifyFooterCopyright()
      .verifyFooterAcknowledgement()
      .validateSocailMediaLinks()
      .validateAboutUSLink()
      .validateMenuHorizontalBlockLink();
  });

  it('Verify footer components on Mobile', { tags: [Tags.DEV, Tags.MOBILE] }, () => {
    // Publishing the page for Footer Section
    cy.viewport(412, 915);
    aemManager.publishPage();
    aemManager.visitPage();
    // Perform assertions to verify the Footer Section
    Footer.verifyFooterIsDisplayed()
      .verifyFooterLogoIsDisplayed()
      .verifyBackToTopLink()
      .verifyConnectWithUsDisplayed()
      .verifyFooterCopyright()
      .verifyFooterAcknowledgement()
      .validateSocailMediaLinks()
      .validateAboutUSLink()
      .validateMenuHorizontalBlockLink()
      .verifyFooterInMobileView();
  });
});
