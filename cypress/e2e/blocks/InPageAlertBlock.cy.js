import AEMTestManager from '../../support/AEM/AEMTestManager.js';
import InPageAlertBlock from '../../support/pages/blocks/InPageAlertBlock.js';
import {
  alertPropValues,
  alert,
  information,
} from '../../fixtures/props/inPageAlertProps.js';

import { Tags } from '../../support/tagList.js';

const { hyperLinkText, urlLink } = alertPropValues;

let aemManager;

describe('In Page Alert Block Test', () => {
  beforeEach(() => {
    AEMTestManager.setup().then((instance) => {
      aemManager = instance;
    });
  });

  afterEach(() => {
    aemManager.teardown();
  });

  it('Create InPage Alert Block', { tags: [Tags.DEV, Tags.DESKTOP] }, () => {
    // Create the InPage alert block with the mapped properties
    InPageAlertBlock.createBlock(information, aemManager);
    InPageAlertBlock.createBlock(alert, aemManager);
    aemManager.publishPage();
    aemManager.visitPage();
    InPageAlertBlock.verifyAlertIsVisible(information.alertType).verifyAlertBlockContents(
      information.alertType,
      information.captionText,
      hyperLinkText,
      urlLink,
    );
    InPageAlertBlock.verifyAlertIsVisible(alert.alertType).verifyAlertBlockContents(
      alert.alertType,
      alert.captionText,
      hyperLinkText,
      urlLink,
    );
  });
});
