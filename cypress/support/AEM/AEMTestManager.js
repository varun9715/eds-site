import AEMHTTPServices from './aemHttpServices.js';
import EdsNavigator from '../navigation/edsNavigator.js';
import UniversalEditorHTTPServices from './universalEditorHttpServices.js';

const pageParentPath = '/content/eds-site/en-au/cypress';
const pageTemplate = '/libs/core/franklin/templates/page';

export default class AEMTestManager {
  constructor({
    pageLabel,
    pageTitle,
    aemServices,
    accessToken,
    edsNavigator,
    universalEditor,
  }) {
    this.pageLabel = pageLabel;
    this.pageTitle = pageTitle;
    this.pageParentPath = pageParentPath;
    this.aemServices = aemServices;
    this.accessToken = accessToken;
    this.edsNavigator = edsNavigator;
    this.universalEditor = universalEditor;
  }

  static setup() {
    const timestamp = Date.now();
    const pageLabel = `test-label-${timestamp}`;
    const pageTitle = `cypress-${timestamp}`;
    const aemServices = new AEMHTTPServices(
      pageLabel,
      pageTitle,
      pageTemplate,
      pageParentPath,
    );

    const edsNavigator = new EdsNavigator();

    aemServices.login().createPage();

    return cy.task('exchangeJwtForAccessToken').then(
      (token) =>
        new AEMTestManager({
          pageLabel,
          pageTitle,
          pageParentPath,
          aemServices,
          accessToken: token,
          edsNavigator,
          universalEditor: new UniversalEditorHTTPServices(token),
        }),
    );
  }

  teardown() {
    return this.aemServices.login().unpublishPage().deletePage();
  }

  publishPage() {
    return this.aemServices.login().publishPage();
  }

  visitPage() {
    return this.edsNavigator.visit(this.pageLabel);
  }
}
