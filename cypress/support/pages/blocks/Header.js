import HeaderJSon from '../../../../blocks/header/_header';
import BlockBuilder from '../../utils/BlockBuilder.js';
import {
  hideRegionSelector,
  hideShoppingCart,
} from '../../../fixtures/props/headerProps.js';
import RegionJson from '../../../../blocks/region-selector/_region-selector';
import ShoppingJson from '../../../../blocks/shopping-cart-widget/_shopping-cart-widget';

const sectionDefinition = HeaderJSon.definitions[0];
const regionDefintion = RegionJson.definitions[0];
const shoppingDefinition = ShoppingJson.definitions[0];

// Element selectors for the Header section
const headerSection = '[data-testid="header-block"]';
const mainContent = 'main>[data-testid="section"]';

// selector for Logo within header section
const logoBlock = '[data-testid="logo-block"]>a';
const primaryImg = 'img[src="/icons/runway_brand_logo_master_qantas_horiz_solid.svg"]';
const secondaryImg = 'img[src="/icons/runway_brand_logo_partner_oneworld.svg"]';

// selector for Region selector within Header Section
const mobileRegionSelector =
  '[class="region-selector-wrapper mobile-region-selector-wrapper"]';
const regionSelectorWrapper = '[class="region-selector-wrapper"]';
const regionselectorBlock = '[data-testid="regionselector-block"]>a';
const flagandLabel = 'span.flag + span.region-label';
const hideRegionBlock =
  '[class="region-selector hide-region-selector block"][data-testid="regionselector-block"]';

// selector for Help within Header Section
const helpBlock = '[class="help-wrapper"]>[data-testid="help-block"]';
const helpLabel = 'a[aria-label="Help"]';

// selector for shopping cart within Header Section
const shoppingCartBlock = '[data-testid="shoppingcartwidget-block"]';
const shoppingCartButton = 'button[aria-label="Shopping Cart"]';
const hideShoppingBlock =
  '[class="shopping-cart-widget hide-shopping-cart block"][data-testid="shoppingcartwidget-block"]';

// selector for Login within Header Section
const loginBlock = '[data-testid="login-block"]';
const loginbutton = '[data-testid="qdd-login-ribbon--log-in"]';

// selector for mobileView
const harmburgerMenu = 'button[class="mobile-menu-toggle mobile-nav-button"]';

// Text for Header Section
const helpURL = 'https://help.qantas.com/support/s/';
const qantasURL = 'qantas.com';

export default class Header {
  static get headerSection() {
    return cy.get(headerSection);
  }

  // Static method to create Section
  static createSection(aemManager) {
    BlockBuilder.create({
      blockDefinition: sectionDefinition,
      aemManager,
      resourceType: 'header-section',
    });
  }

  // Static method to create blocks with the provided properties
  static createBlock(blockdef, blockPropsValue, aemManager) {
    BlockBuilder.create({
      blockDefinition: blockdef,
      blockProps: blockPropsValue,
      aemManager,
      parentResourceType: 'inside-section',
    });
  }

  // Static method to create RegionSelector and ShoppingCart in HeaderSection
  static createRegionAndShopping(aemManager) {
    this.createSection(aemManager);
    this.createBlock(regionDefintion, hideRegionSelector, aemManager);
    this.createBlock(shoppingDefinition, hideShoppingCart, aemManager);
    return this;
  }

  // Verify Primary and Secondary logo in header section
  static verifyLogoBlock() {
    this.headerSection.find(logoBlock).each(($ele) => {
      cy.wrap($ele)
        .should('be.visible')
        .and('have.attr', 'href')
        .and('include', qantasURL);
    });
    this.headerSection.find(logoBlock).then(($ele) => {
      cy.get($ele).find(primaryImg).should('be.visible');
      cy.get($ele).find(secondaryImg).should('be.visible');
    });
    return this;
  }

  // verify Region selector Block within header section
  static verifyRegionSelectorBlock() {
    cy.get(regionSelectorWrapper)
      .find(regionselectorBlock)
      .then(($ele) => {
        cy.get($ele)
          .should('be.visible')
          .and('have.attr', 'href')
          .and('include', qantasURL);
        cy.get($ele).find(flagandLabel).should('be.visible');
      });
    return this;
  }

  // verify Login and ShoppingCart Block within header section
  static verifyLoginAndShoppingBlock() {
    this.headerSection.then(($ele) => {
      cy.get($ele)
        .find(loginBlock)
        .should('be.visible')
        .find(loginbutton)
        .should('be.visible')
        .and('have.text', 'Log in');
      cy.get($ele)
        .find(shoppingCartBlock)
        .should('be.visible')
        .find(shoppingCartButton)
        .should('be.visible');
    });
    return this;
  }

  // verify Help Block within header section
  static verifyHelpBlock() {
    cy.get(helpBlock)
      .find(helpLabel)
      .should('be.visible')
      .and('have.attr', 'href', helpURL);
    return this;
  }

  // verify Region Selector within header section in Mobile view
  static verifyRegionSelectorMobile() {
    cy.get(mobileRegionSelector)
      .find(regionselectorBlock)
      .then(($ele) => {
        cy.get($ele)
          .should('be.visible')
          .and('have.attr', 'href')
          .and('include', qantasURL);
        cy.get($ele).find(flagandLabel).should('be.visible');
      });
    return this;
  }

  // verify header section and its blocks in MobileView
  static VerifyInMobileView() {
    cy.viewport(412, 915);
    this.verifyLogoBlock();
    this.verifyLoginAndShoppingBlock();
    cy.get(harmburgerMenu).click();
    this.verifyRegionSelectorMobile();
    this.verifyHelpBlock();
    return this;
  }

  // verify Hide Region Selector and Shopping cart within header Section
  static verifyHideRegionAndShopping() {
    cy.get(mainContent).then(($ele) => {
      cy.get($ele)
        .find(regionSelectorWrapper)
        .find(hideRegionBlock)
        .should('not.be.visible');
      cy.get($ele).find(hideShoppingBlock).should('not.be.visible');
    });
    return this;
  }
}
