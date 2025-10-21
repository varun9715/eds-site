import AEMTestManager from '../../support/AEM/AEMTestManager.js';
import Hero from '../../support/pages/blocks/HeroBlock.js';
import { Tags } from '../../support/tagList.js';

import {
  heroAllData,
  heroWithoutImage,
  heroWithoutLogo,
  heroImageAssetId,
  logoImageAssetId,
} from '../../fixtures/props/heroProps.js';

let aemManager;

describe('Hero Block Test', () => {
  // Initialize AEMTestManager before each test
  beforeEach(() =>
    AEMTestManager.setup().then((instance) => {
      aemManager = instance;
    }),
  );

  afterEach(() => {
    aemManager.teardown();
  });

  it('Create Hero Blocks and run assertions ', { tags: [Tags.DEV, Tags.DESKTOP] }, () => {
    // Create the Hero block with the different properties
    Hero.createBlock(heroAllData, aemManager);
    Hero.createBlock(heroWithoutImage, aemManager);
    Hero.createBlock(heroWithoutLogo, aemManager);

    aemManager.publishPage();
    aemManager.visitPage();

    // Verify Hero Block with All Data
    Hero.verifyHeroBlockIsVisible(heroAllData.heading)
      .verifyHeroHeadingText(heroAllData.heading)
      .verifyHeroIntroText(heroAllData.introText)
      .verifyHeroImage(heroImageAssetId)
      .verifyHeroImageCaptionText(heroAllData.imageCaption)
      .verifyHeroLogo(logoImageAssetId);

    // Verify Hero Block without Image
    Hero.verifyHeroBlockIsVisible(heroWithoutImage.heading)
      .verifyHeroHeadingText(heroWithoutImage.heading)
      .verifyHeroIntroText(heroWithoutImage.introText)
      .verifyHeroImageAndCaptionIsNotPresent()
      .verifyHeroLogo(logoImageAssetId);

    // Verify Hero Block without Logo
    Hero.verifyHeroBlockIsVisible(heroWithoutLogo.heading)
      .verifyHeroHeadingText(heroWithoutLogo.heading)
      .verifyHeroIntroText(heroWithoutLogo.introText)
      .verifyHeroImage(heroImageAssetId)
      .verifyHeroImageCaptionText(heroWithoutLogo.imageCaption)
      .verifyHeroLogoIsNotPresent();
  });

  // Visual Testing with Applitools - This is for example but don't use it in all blocks now
  // commented for now
  // it.skip(
  //   'Run Hero Block Visual Tests on Applitools',
  //   { tags: [Tags.DEV, Tags.DESKTOP] },
  //   () => {
  //     Hero.createBlock(heroAllData, aemManager);

  //     aemManager.publishPage();
  //     aemManager.visitPage();

  //     Hero.verifyHeroBlockIsVisible();
  //     cy.eyesOpen({
  //       appName: 'EDS Qantas - Block level',
  //       testName: `Block test for "${'Hero'}" block`,
  //       branchName: 'dev',
  //       envName: 'dev',
  //       ignoreDisplacements: true,
  //     });
  //     cy.eyesCheckWindow();
  //     cy.eyesClose();
  //   },
  // );
});
