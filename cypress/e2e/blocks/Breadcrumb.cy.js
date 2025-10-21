import AEMTestManager from '../../support/AEM/AEMTestManager.js';
import Breadcrumb from '../../support/pages/blocks/Breadcrumb.js';
import { Tags } from '../../support/tagList.js';

let aemManager;

describe('Breadcrumb Block Test', () => {
  beforeEach(() => {
    AEMTestManager.setup().then((instance) => {
      aemManager = instance;
    });
  });

  afterEach(() => {
    aemManager.teardown();
  });

  it(
    'Verify the default breadcrumb on a page',
    { tags: [Tags.DEV, Tags.DESKTOP] },
    () => {
      aemManager.publishPage();
      aemManager.visitPage();

      // Verify the breadcrumb is visible and has the correct structure
      Breadcrumb.verifyBreadcrumbIsVisible()
        .verifyFirstBreadcrumbIsHomepage()
        .verifyCurrentPageTitle(`${aemManager.pageTitle}`)
        .verifyClickableBreadcrumbs();
    },
  );

  it(
    'Validates the breadcrumb is hidden when “Hide breadcrumb” toggle is enabled',
    { tags: [Tags.DEV, Tags.DESKTOP] },
    () => {
      // Create a new page with the breadcrumb block and hide the breadcrumb
      Breadcrumb.hideBreadCrumb(aemManager);
      aemManager.publishPage();

      // Visit the page to verify the breadcrumb is hidden
      aemManager.visitPage();
      Breadcrumb.verifyHideBreadcrumbViaToggle();
    },
  );
});
