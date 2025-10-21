import EdsNavigator from '../../support/navigation/edsNavigator.js';
import AEMHTTPServices from '../../support/AEM/aemHttpServices.js';
import UniversalEditorHTTPServices from '../../support/AEM/universalEditorHttpServices.js';
import { allBlocksSetup } from '../../support/visreg/blockSetupMapping.js';
import HeroBlock from '../../support/pages/blocks/HeroBlock.js';
import CardsBlock from '../../support/pages/blocks/CardsBlock.js';

describe.skip(
  'Example - Visual Regression tests for all blocks on 1 page',
  { tags: '@dev' },
  () => {
    const timestamp = Date.now();
    const pageLabel = `test-label-${timestamp}`;
    const pageTitle = `cypress-${timestamp}`;
    const pageParentPath = '/content/qcom/en-au/cypress';
    const pageTemplate = '/libs/core/franklin/templates/page';
    let accessToken;

    const aemHTTPServices = new AEMHTTPServices(
      pageLabel,
      pageTitle,
      pageTemplate,
      pageParentPath,
    );

    const edsNavigator = new EdsNavigator();

    before(() => {
      aemHTTPServices.login().createPage();
      cy.task('exchangeJwtForAccessToken').then((token) => {
        accessToken = token;
      });
    });

    after(() => {
      aemHTTPServices.login().unpublishPage().deletePage();
    });

    it('create all blocks', () => {
      const universalEditorHttpServices = new UniversalEditorHTTPServices(accessToken);
      let blockId = '';

      allBlocksSetup.forEach((block) => {
        universalEditorHttpServices.add(
          block.blockName,
          pageParentPath,
          pageLabel,
          block.blockAddContent,
        );
        if (block.hasChildBlock) {
          universalEditorHttpServices
            .details('section', pageParentPath, pageLabel)
            .then((sectionDetails) => {
              blockId = Object.keys(sectionDetails.data).find((key) =>
                key.startsWith('block_'),
              );
              universalEditorHttpServices.add(
                block.childBlockName,
                pageParentPath,
                pageLabel,
                block.childBlockAddContent,
                blockId,
              );
            });
        }
      });
    });

    it('configure all blocks', () => {
      const universalEditorHttpServices = new UniversalEditorHTTPServices(accessToken);
      let blockId = '';

      allBlocksSetup.forEach((block) => {
        universalEditorHttpServices.patch(
          block.blockName,
          pageParentPath,
          pageLabel,
          block.blockPatchConfigurationBody,
        );
        if (block.hasChildBlock) {
          universalEditorHttpServices
            .details('section', pageParentPath, pageLabel)
            .then((sectionDetails) => {
              blockId = Object.keys(sectionDetails.data).find((key) =>
                key.startsWith('block_'),
              );
              universalEditorHttpServices.patch(
                block.childBlockName,
                pageParentPath,
                pageLabel,
                block.childBlockPatchConfigurationBody,
                blockId,
              );
            });
        }
      });
    });

    it('publish the page', () => {
      aemHTTPServices.login().publishPage();
    });

    it('verify elements on the published page', () => {
      edsNavigator.visit(`${pageLabel}`);
      HeroBlock.verifyHeroBlockIsVisible();
      HeroBlock.verifyHeroImageAltText('Dummy Alt Text For Hero Banner Image');
      HeroBlock.verifyHeroParagraphText('Dummy Text For Hero Banner Image');
      CardsBlock.verifyCardsBlockIsVisible();
      CardsBlock.verifyCardsParagraphText('Dummy Text For Card Image');
    });

    it.skip('run applitools validation', () => {
      edsNavigator.visit(`${pageLabel}`);
      HeroBlock.verifyHeroBlockIsVisible();
      CardsBlock.verifyCardsBlockIsVisible();
      cy.eyesOpen({
        appName: 'EDS Qantas - All Blocks on 1 Page',
        testName: 'Visreg Page test',
        branchName: 'dev',
        envName: 'dev',
        ignoreDisplacements: true,
      });
      cy.eyesCheckWindow();
      cy.eyesClose();
    });
  },
);
