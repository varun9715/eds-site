import AEMTestManager from '../../support/AEM/AEMTestManager.js';
import navigation from '../../support/pages/blocks/Navigation.js';
import l1NavMenu from '../../fixtures/props/navigationProps.js';
import { Tags } from '../../support/tagList.js';

let aemManager;
describe('Navigation Block', () => {
  beforeEach(() => {
    AEMTestManager.setup().then((instance) => {
      aemManager = instance;
    });
  });

  afterEach(() => {
    aemManager.teardown();
  });

  it(
    'Create and Publish and verify Navigation Menu - Desktop',
    { tags: [Tags.DEV] },
    () => {
      // Publishing the Page
      aemManager.publishPage();

      // Visit Published page and perform assertions
      aemManager.visitPage();
      l1NavMenu.forEach((l1NaveMenuTitle) => {
        navigation.verifyNavigationRoot().verifyNavigationMenuItems(l1NaveMenuTitle);
      });
    },
  );
  it(
    'Create and Publish and verify Navigation Menu - Mobile/Tablet',
    { tags: [Tags.DEV, Tags.MOBILE] },
    () => {
      cy.viewport('iphone-x');
      // Publishing the Page
      aemManager.publishPage();

      // Visit Published page and perform assertions
      aemManager.visitPage();
      navigation.clickAndVerifyMobileMenu().verifyNavMobile('Flights');
    },
  );
});
