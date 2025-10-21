const breadcrumbBlock = '[data-block-name="breadcrumbs"]';
const breadcrumbItems = '[data-block-name="breadcrumbs"] ol li';
const breadcrumbCurrentpage = 'li.caption.currentPage';
export default class Breadcrumb {
  static verifyBreadcrumbIsVisible() {
    cy.get(breadcrumbBlock).should('exist').and('be.visible');
    return this;
  }

  static verifyFirstBreadcrumbIsHomepage() {
    cy.get(breadcrumbItems).first().should('contain.text', 'Home');
    return this;
  }

  static getBreadcrumbItems() {
    return cy.get(breadcrumbItems);
  }

  static verifyClickableBreadcrumbs() {
    Breadcrumb.getBreadcrumbItems().each(($el, index, $list) => {
      if (index < $list.length - 1) {
        cy.wrap($el).find('a').should('exist').and('have.attr', 'href');
      } else {
        cy.wrap($el).find('a').should('not.exist');
      }
    });
    return this;
  }

  static hideBreadCrumb(aemManager) {
    const payload = [
      {
        op: 'replace',
        path: '/hidebreadcrumb',
        value: true,
      },
    ];
    const blockId = '';
    const resorceType = 'page';
    cy.wrap(null).then(() => {
      aemManager.universalEditor.patch(
        blockId,
        aemManager.pageParentPath,
        aemManager.pageLabel,
        payload,
        resorceType,
      );
    });
    return this;
  }

  static verifyCurrentPageTitle(expectedTitle) {
    cy.get(breadcrumbCurrentpage)
      .should('contain.text', expectedTitle)
      .find('a')
      .should('not.exist');
    return this;
  }

  static verifyHideBreadcrumbViaToggle() {
    cy.get(breadcrumbBlock).should('not.exist');

    return this;
  }
}
