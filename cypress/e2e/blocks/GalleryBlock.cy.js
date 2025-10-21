import AEMTestManager from '../../support/AEM/AEMTestManager.js';
import galleryProps from '../../fixtures/props/galleryProps.js';
import GalleryBlock from '../../support/pages/blocks/GalleryBlock.js';
import { Tags } from '../../support/tagList.js';

const itemBlockProperties = galleryProps.galleryImageProp;
let aemManager;

describe('Gallery Container and Image Block', () => {
  beforeEach(() =>
    AEMTestManager.setup().then((instance) => {
      aemManager = instance;
    }),
  );

  afterEach(() => {
    aemManager.teardown(); // Unpublish and delete page
  });

  it('Create Gallery Block with 1 Image', { tags: [Tags.DEV, Tags.DESKTOP] }, () => {
    // Create Page
    GalleryBlock.createAndVerifyGallery(
      galleryProps.galleryImageProp[1],
      aemManager,
      'single',
    );
    // Publish Page
    aemManager.publishPage();
    aemManager.visitPage();
    // Assert publish page contents
    GalleryBlock.verifyContentWrapperSingle(
      galleryProps.galleryImageProp[1],
    ).verifyNavButtonisDisplayed();
  });

  it('Create Gallery with Multiple Image', { tags: [Tags.DEV, Tags.DESKTOP] }, () => {
    // Create Page
    GalleryBlock.createAndVerifyGallery(itemBlockProperties, aemManager, 'multiple');
    // Publish Page
    aemManager.publishPage();
    aemManager.visitPage();
    // Assert publish page contents
    GalleryBlock.verifyContentWrapperMultiple(
      itemBlockProperties,
    ).verifyNavButtonisDisplayed();
  });
});
