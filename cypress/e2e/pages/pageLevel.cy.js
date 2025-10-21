import AboutUsLandingPage from '../../support/pages/pageLevel/AboutUsLandingPage.js';

describe('Example - About Us Page Level Tests', { tags: '@dev' }, () => {
  beforeEach(() => {
    AboutUsLandingPage.visitPage();
  });

  it('should display the About Us title section', () => {
    AboutUsLandingPage.defaultSection().should('be.visible');
  });

  it.skip('should verify that the About Us title has correct text', () => {
    AboutUsLandingPage.verifyTitleText('About Us');
  });
});
