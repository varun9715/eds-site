import AEMTestManager from '../../support/AEM/AEMTestManager.js';
import {
  anchorSectionProps,
  anchorSectionPropsArray,
  pageLinksmorethanFive,
  titleValue,
} from '../../fixtures/props/pagenavProps.js';
import InPageNavBlock from '../../support/pages/blocks/InPageNavBlock.js';
import { Tags } from '../../support/tagList.js';

let aemManager;
const hidePageLink = anchorSectionProps.pageLinkNotVisible['anchor-link-text'];
const visiblePageLink = anchorSectionProps.pageLinkIsVisible['anchor-link-text'];

describe('In Page Navigation Test', () => {
  beforeEach(() =>
    AEMTestManager.setup().then((instance) => {
      aemManager = instance;
    }),
  );

  afterEach(() => {
    aemManager.teardown();
  });

  it('Create and verify In Page navigation', { tags: [Tags.DEV, Tags.DESKTOP] }, () => {
    // create InPage Navigation
    InPageNavBlock.createBlock(aemManager);
    // Create Visible and not visible page links on the same page
    anchorSectionPropsArray.forEach((anchorProp, index) => {
      InPageNavBlock.createSection(anchorProp, aemManager);
      // Add title for each Anchor Section
      InPageNavBlock.createTitleBlock(titleValue[index], aemManager);
    });

    // publish and visit page
    aemManager.publishPage();
    aemManager.visitPage();

    // Perform assertions on the In Page Navigation
    InPageNavBlock.verifyInPageNavBlockandHeading()
      .verifyInPageLinkNotVisible(hidePageLink)
      .verifyPageLinksClickableandVisible(visiblePageLink)
      // Perform assertions on the In Page Navigation with less than 5 links for column alignment
      .verifyInPageNavColumns()
      // Perform assertions on the In Page Navigation with less than 5 links for Mobile view
      .setViewport(412, 915)
      .verifyInPageNavShowMoreLink();
  });

  it(
    'Create and verify In Page navigation with more than 5 links',
    { tags: [Tags.DEV, Tags.DESKTOP] },
    () => {
      InPageNavBlock.createBlock(aemManager);
      // create InPage Navigation with more than 5 links
      pageLinksmorethanFive.forEach((anchorProp, index) => {
        InPageNavBlock.createSection(anchorProp, aemManager);
        // Add title for each Anchor Section
        InPageNavBlock.createTitleBlock(titleValue[index], aemManager);
      });

      // publish and visit page
      aemManager.publishPage();
      aemManager.visitPage();

      // Perform assertions on the In Page Navigation
      InPageNavBlock.verifyInPageNavColumns()
        // Perform assertions on the In Page Navigation for Mobile View
        .setViewport(412, 915)
        .verifyInPageNavShowMoreLink()
        .verifyInPageNavShowLessLink();
    },
  );
});
