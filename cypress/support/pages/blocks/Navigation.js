// Element selectors for Navigation
const navigationBar = '[data-testid="header-menu-list"]';
const navigationBarContent = '[data-testid="header-menu-bar"]';
const navMenuItems = '[data-testid="header-menu-item-first"]';
const subMenuContent = '[class="submenu-content"]';
const subMenuDivWrapper = '[class="menu-wrapper"]';
const subMenuList = '[data-testid="menu-link"]';
// Mobile/Tablet View
const mobileHamBurger = '[data-testid="header-mobile-menu-toggle"]';
const subMenuBack = '[data-testid="header-submenu-back-button"]';
const helpSection = '[data-testid="help-block"]';

export default class navigation {
  static verifyNavigationRoot() {
    cy.get(navigationBar).should('be.visible');
    cy.get(navigationBarContent).should('be.visible');
    cy.get(helpSection).should('be.visible');
    return this;
  }

  static verifyNavigationMenuItems(l1NaveMenuTitle) {
    cy.get(navMenuItems)
      .contains(l1NaveMenuTitle)
      .should('be.visible')
      .each(($li) => {
        cy.wrap($li)
          .trigger('mouseover')
          .then(() => {
            cy.get(subMenuContent)
              .find(subMenuDivWrapper)
              .find(subMenuList)
              .each(($subMenuLi) => {
                expect($subMenuLi).to.have.nested.attr('href');
              });
          });
      });
    return this;
  }

  static clickAndVerifyMobileMenu() {
    cy.get(mobileHamBurger).should('be.visible').click();
    return this;
  }

  static verifyNavMobile(l1NaveMenuTitle) {
    cy.get(navMenuItems)
      .contains(l1NaveMenuTitle)
      .should('be.visible')
      .each(($li) => {
        cy.wrap($li)
          .click()
          .then(() => {
            cy.get(subMenuContent)
              .find(subMenuDivWrapper)
              .find(subMenuList)
              .should('be.visible')
              .each(($subMenuLi) => {
                expect($subMenuLi).to.have.nested.attr('href');
              });
            cy.get(subMenuBack).first().click();
          });
      });
    return this;
  }
}
