import AEMTestManager from '../../support/AEM/AEMTestManager.js';
import { Tags } from '../../support/tagList.js';

import {
  anchorSectionPropsArray,
  anchorSectionProps,
  titleValue,
} from '../../fixtures/props/anchorSectionProps.js';
import AnchorSection from '../../support/pages/blocks/AnchorSection.js';

const anchorTextNoBackToTop =
  anchorSectionProps.anchorSectionHideBackToTop['anchor-link-text'];
const anchorTextWithBackToTop =
  anchorSectionProps.anchorSectionAllValues['anchor-link-text'];
const anchorTextExcludeAnchorLink =
  anchorSectionProps.anchorSectionExcludeAnchorLink['anchor-link-text'];

let aemManager;

describe('Anchor Section Test', () => {
  beforeEach(() =>
    AEMTestManager.setup().then((instance) => {
      aemManager = instance;
    }),
  );

  afterEach(() => {
    aemManager.teardown();
  });

  it(
    'Create and verify Anchor Sections with different properties',
    { tags: [Tags.DEV, Tags.DESKTOP] },
    () => {
      // Create all three block variations on the same page
      anchorSectionPropsArray.forEach((anchorProp, index) => {
        AnchorSection.createSection(anchorProp, aemManager);
        // Add title for each Anchor Section
        AnchorSection.createBlock(titleValue[index], aemManager);
      });

      // publish and visit page
      aemManager.publishPage();
      aemManager.visitPage();

      // Assertions on the Anchor Sections
      AnchorSection.verifyBacktoTopLinkNotVisible(anchorTextNoBackToTop)
        .verifyBacktoTopLinkIsVisible(anchorTextWithBackToTop)
        .verifyDataExcludeFromAnchorLink(anchorTextExcludeAnchorLink);
    },
  );
});
