import AEMTestManager from '../../support/AEM/AEMTestManager.js';
import Header from '../../support/pages/blocks/Header.js';
import { Tags } from '../../support/tagList.js';

let aemManager;

describe('Header Section Test', () => {
  beforeEach(() => {
    AEMTestManager.setup().then((instance) => {
      cy.viewport('macbook-16');
      aemManager = instance;
    });
  });

  afterEach(() => {
    aemManager.teardown();
  });

  it('Verify HeaderSection', { tags: [Tags.DEV, Tags.DESKTOP] }, () => {
    // Create Region selector and Shopping cart in header section
    Header.createRegionAndShopping(aemManager);
    // Publishing the page for Header Section
    aemManager.publishPage();
    aemManager.visitPage();
    // Perform assertions to verify the Header Section
    Header.verifyLogoBlock()
      .verifyRegionSelectorBlock()
      .verifyLoginAndShoppingBlock()
      // Perform assertions to verify Hide RegionSelector and ShoppingCart
      .verifyHideRegionAndShopping()
      .verifyHelpBlock();
  });

  it('Verify HeaderSection in MobileView', { tags: [Tags.DEV, Tags.DESKTOP] }, () => {
    // Publishing the page for Header Section
    aemManager.publishPage();
    aemManager.visitPage();
    // Perform assertions to verify the Header Section in MobileView
    Header.VerifyInMobileView();
  });
});
