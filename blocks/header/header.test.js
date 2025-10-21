import { describe, it, expect, vi, beforeEach } from 'vitest';
import decorate from './header.js';

import { loadFragment } from '../fragment/fragment.js';
import { fetchLanguagePlaceholders } from '../../scripts/scripts.js';

const mockLoadShoppingCartScripts = vi.fn();
const mockLoadLoginScripts = vi.fn();

vi.mock('../shopping-cart-widget/shopping-cart-widget.js', async () => ({
  loadShoppingCartScripts: mockLoadShoppingCartScripts,
}));

vi.mock('../login/login.js', async () => ({
  loadLoginScripts: mockLoadLoginScripts,
}));

vi.mock('../../scripts/scripts.js', async () => ({
  loadBreadcrumbs: vi.fn(),
  moveInstrumentation: vi.fn(),
  getEDSLink: vi.fn().mockReturnValue('/mock-path'),
  getPathDetails: vi.fn().mockReturnValue({ langRegion: 'en-au' }),
  fetchLanguagePlaceholders: vi.fn(),
}));

// Mock the dependencies
vi.mock('../../scripts/utils/dom.js', async () => {
  const actual = await vi.importActual('../../scripts/utils/dom.js');

  return {
    ...actual,
    isMobileOrTabletScreen: vi.fn(() => false),
  };
});

describe('decorate()', () => {
  let block;
  const mockPlaceholders = {
    headerCloseMobileMenu: 'Close menu',
    headerOpenMobileMenu: 'Open menu',
    headerMainMenu: 'Main Menu',
    headerGoBack: 'Go back',
    globalSkipToMainContent: 'Skip to main content',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mocks
    fetchLanguagePlaceholders.mockResolvedValue(mockPlaceholders);

    mockLoadShoppingCartScripts.mockReset();
    mockLoadLoginScripts.mockReset();
    mockLoadShoppingCartScripts.mockResolvedValue();
    mockLoadLoginScripts.mockResolvedValue();

    block = document.createElement('div');

    // Mock the moveInstrumentation function
    vi.mock('../fragment/fragment.js', () => ({
      loadFragment: vi.fn(async () => {
        const logoSection = `
        <div class="section logo-container" data-section-status="loaded" data-isnavigation="false" style="">
            <div class="logo-wrapper">
                <div class="logo block" data-block-name="logo" data-block-status="loaded">
                    <a href="http://localhost:3000/en-au/" aria-label="Home, Qantas Airways Logo">
                        <img src="/icons/runway_brand_logo_partner_oneworld.svg" alt="Home, Qantas Airways Logo">
                    </a>
                </div>
            </div>
            <div class="logo-wrapper">
                <div class="logo block" data-block-name="logo" data-block-status="loaded">
                    <a href="http://localhost:3000/en-au/about-us/our-company" aria-label="Qantas and Oneworld Travel Alliance">
                        <img src="/icons/runway_brand_logo_master_qantas_horiz.svg" alt="Qantas and Oneworld Travel Alliance">
                    </a>
                </div>
            </div>
        </div>`;

        const utilitiesSection = `
        <div class="section region-selector-container" data-section-status="loaded" style="">
          <div class="region-selector-wrapper">
              <div class="region-selector block" data-block-name="region-selector" data-block-status="loaded">
                  <a href="http://localhost:3000/en-au" class="region-selector-anchor" aria-labelledby="regionSelector">
                      <span id="regionSelector" class="visually-hidden">Change country and language. Current selection: Australia, English</span>
                      <span class="flag" aria-hidden="true">
              <img src="/icons/runway_country_flag_australia.svg" alt="">
            </span>
                      <span class="region-label" aria-hidden="true">
              <span class="region">AU</span>
                      <span class="pipe">|</span>
                      <span class="lang">EN</span>
                      </span>
                  </a>
              </div>
          </div>
          <div class="shopping-cart-widget-wrapper">
            <div class="shopping-cart-widget block widget-is-loaded" data-block-name="shopping-cart-widget" data-block-status="loaded">
              <div data-widget-type="shoppingcart" id="shoppingcart" class="clearfix">
                <script type="qantas/widget">{"environment":"development","languageCode":"en","countryCode":"au"}</script>
              </div>
            </div>
          </div>
          <div class="login-wrapper">
            <div class="login block widget widget-is-loaded" data-block-name="login" data-block-status="loaded">
              <div class="qdd-login-ribbon-host" data-widget-host="qdd-login-ribbon"></div>
            </div>
          </div>
      </div>`;

        const supportingSection = `
      <div class="section help-container" data-section-status="loaded" style="">
          <div class="help-wrapper">
              <div class="help block" data-block-name="help" data-block-status="loaded">
                  <a href="https://help.qantas.com/support/s/" aria-label="Help">
                      <img src="/icons/runway_icon_question_mark.svg" alt="" aria-hidden="true">
                      <span>Help</span>
                  </a>
              </div>
          </div>
      </div>`;

        const flightMenu = `
      <div class="section menu-container" data-section-status="loaded" data-isnavigation="true" data-navigation-title="Flights" style="">
          <div class="menu-wrapper">
              <div class="menu shortcuts block" data-block-name="menu" data-block-status="loaded">
                  <h3>Shortcut</h3>
                  <ul class="menu">
                      <li><a href="#" title="Book flights" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2"><span class="icon icon-runway_pictogram_plane_tail_red"><img data-icon-name="runway_pictogram_plane_tail_red" src="/icons/runway_pictogram_plane_tail_red.svg" alt="" loading="lazy"></span>Book flights</a></li>
                      <li><a href="#" title="Check-in" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2"><span class="icon icon-runway_pictogram_boarding_passes_plane"><img data-icon-name="runway_pictogram_boarding_passes_plane" src="/icons/runway_pictogram_boarding_passes_plane.svg" alt="" loading="lazy"></span>Check-in</a></li>
                      <li><a href="#" title="Manage booking" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2"><span class="icon icon-runway_pictogram_cogwheel_with_plane"><img data-icon-name="runway_pictogram_cogwheel_with_plane" src="/icons/runway_pictogram_cogwheel_with_plane.svg" alt="" loading="lazy"></span>Manage booking</a></li>
                      <li><a href="#" title="Flight status" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2"><span class="icon icon-runway_pictogram_plane_with_clock"><img data-icon-name="runway_pictogram_plane_with_clock" src="/icons/runway_pictogram_plane_with_clock.svg" alt="" loading="lazy"></span>Flight status</a></li>
                      <li><a href="#" title="Baggage" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2"><span class="icon icon-runway_pictogram_baggage_additional_payment"><img data-icon-name="runway_pictogram_baggage_additional_payment" src="/icons/runway_pictogram_baggage_additional_payment.svg" alt="" loading="lazy"></span>Baggage</a></li>
                      <li><a href="#" title="Travel credits" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2"><span class="icon icon-runway_pictogram_ticket_multi_trip"><img data-icon-name="runway_pictogram_ticket_multi_trip" src="/icons/runway_pictogram_ticket_multi_trip.svg" alt="" loading="lazy"></span>Travel credits</a></li>
                  </ul>
              </div>
          </div>
          <div class="menu-wrapper">
              <div class="menu block" data-block-name="menu" data-block-status="loaded">
                  <h3>Book</h3>
                  <ul class="menu">
                      <li><a href="#" title="Book flights" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Book flights</a></li>
                      <li><a href="#" title="Multi city" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Multi city</a></li>
                      <li><a href="#" title="Group travel" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Group travel</a></li>
                      <li><a href="#" title="Flight deals" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Flight deals</a></li>
                      <li><a href="#" title="Timetables" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Timetables</a></li>
                      <li><a href="#" title="Network &amp; partner airlines" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Network &amp; partner airlines</a></li>
                  </ul>
              </div>
          </div>
          <div class="menu-wrapper">
              <div class="menu block" data-block-name="menu" data-block-status="loaded">
                  <h3>Prepare to fly</h3>
                  <ul class="menu">
                      <li><a href="#" title="Book flights" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Book flights</a></li>
                      <li><a href="#" title="Multi city" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Multi city</a></li>
                      <li><a href="#" title="Group travel" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Group travel</a></li>
                      <li><a href="#" title="Flight deals" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Flight deals</a></li>
                      <li><a href="#" title="Timetables" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Timetables</a></li>
                      <li><a href="#" title="Network &amp; partner airlines" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Network &amp; partner airlines</a></li>
                  </ul>
              </div>
          </div>
          <div class="menu-wrapper">
              <div class="menu block" data-block-name="menu" data-block-status="loaded">
                  <h3>Qantas experience</h3>
                  <ul class="menu">
                      <li><a href="#" title="Book flights" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Book flights</a></li>
                      <li><a href="#" title="Multi city" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Multi city</a></li>
                      <li><a href="#" title="Group travel" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Group travel</a></li>
                      <li><a href="#" title="Flight deals" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Flight deals</a></li>
                      <li><a href="#" title="Timetables" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Timetables</a></li>
                      <li><a href="#" title="Network &amp; partner airlines" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Network &amp; partner airlines</a></li>
                  </ul>
              </div>
          </div>
      </div>`;

        const traveMenu = `
        <div class="section menu-container" data-section-status="loaded" data-isnavigation="true" data-navigation-title="Travel" style="">
          <div class="menu-wrapper">
              <div class="menu block" data-block-name="menu" data-block-status="loaded">
                  <h3>Book travels</h3>
                  <ul class="menu">
                      <li><a href="#" title="Hotels" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Hotels</a></li>
                  </ul>
              </div>
          </div>
          <div class="menu-wrapper">
              <div class="menu block" data-block-name="menu" data-block-status="loaded">
                  <h3>Qantas experience</h3>
                  <ul class="menu">
                      <li><a href="#" title="Book flights" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Book flights</a></li>
                      <li><a href="#" title="Multi city" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Multi city</a></li>
                      <li><a href="#" title="Group travel" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Group travel</a></li>
                      <li><a href="#" title="Flight deals" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Flight deals</a></li>
                      <li><a href="#" title="Timetables" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Timetables</a></li>
                      <li><a href="#" title="Network &amp; partner airlines" class="" data-wae-event="menu_click" data-wae-menu-type="header" data-wae-menu-level="2">Network &amp; partner airlines</a></li>
                  </ul>
              </div>
          </div>
      </div>
      `;

        // Create a mock block element with children
        const fragment = document.createElement('div');
        fragment.innerHTML = `
            ${logoSection}
            ${utilitiesSection}
            ${supportingSection}
            ${flightMenu}
            ${traveMenu}
        `;
        return fragment;
      }),
    }));
  });

  it('should match the rendered snapshot', async () => {
    await decorate(block);
    expect(block).toMatchSnapshot();
  });

  it('should call loadFragment to load header fragment', () => {
    decorate(block);

    // Check if moveInstrumentation is called for each row and image
    expect(vi.mocked(loadFragment).mock.calls.length).toBe(1);
  });

  it('should contain 1 menu navigation', async () => {
    await decorate(block);

    const mainNavs = block.querySelectorAll('.navigation-bar');
    expect(mainNavs).not.toBeNull();
    expect(mainNavs.length).toBe(1);
  });

  it('should contain 2 navigation menus', async () => {
    await decorate(block);

    const mainNavs = block.querySelectorAll('.navigation-menu');
    expect(mainNavs).not.toBeNull();
    expect(mainNavs.length).toBe(2);
  });

  it('submenu should be closed on page load', async () => {
    await decorate(block);

    [...block.querySelectorAll('.navigation-menu')].forEach((menu) => {
      const button = menu.querySelector('.menu-title');
      expect(button.classList.contains('active')).toBeFalsy();
    });
  });

  it('should open flights submenu on click/hover', async () => {
    await decorate(block);

    [...block.querySelectorAll('.navigation-menu')].forEach((menu) => {
      const button = menu.querySelector('.menu-title');
      console.log(button.outerHTML);
      expect(button.classList.contains('active')).toBeFalsy();
      button.click();
      expect(button.classList.contains('active')).toBeTruthy();
      button.click();
      expect(button.classList.contains('active')).toBeFalsy();
    });
  });

  it('should open flights submenu on mouse hover', async () => {
    await decorate(block);

    block.querySelectorAll('.navigation-menu').forEach((menu) => {
      const button = menu.querySelector('.menu-title');
      expect(button.classList.contains('active')).toBeFalsy();

      button.parentNode.dispatchEvent(
        new PointerEvent('pointerenter', { pointerType: 'mouse' }),
      );
      expect(button.classList.contains('active')).toBeTruthy();

      button.parentNode.dispatchEvent(
        new PointerEvent('pointerleave', { pointerType: 'mouse' }),
      );
      expect(button.classList.contains('active')).toBeFalsy();
    });
  });

  it('should close menu when on esc key press', async () => {
    await decorate(block);

    [...block.querySelectorAll('.navigation-menu')].forEach((menu) => {
      const button = menu.querySelector('.menu-title');
      expect(button.classList.contains('active')).toBeFalsy();
      button.parentNode.dispatchEvent(
        new PointerEvent('pointerenter', { pointerType: 'mouse' }),
      );
      expect(button.classList.contains('active')).toBeTruthy();

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
        }),
      );

      expect(button.classList.contains('active')).toBeFalsy();
    });
  });

  it('links should include analytics elements', () => {
    decorate(block);

    [...block.querySelectorAll('.navigation-menu .menu-title')].forEach((button) => {
      expect(button.getAttribute('data-wae-event')).toBe('menu_click');
      expect(button.getAttribute('data-wae-menu-type')).toBe('header');
      expect(button.getAttribute('data-wae-menu-level')).toBe('1');
    });
  });

  it('should call functions to load widget scripts successfully', async () => {
    await decorate(block);
    await new Promise((r) => {
      setTimeout(r, 0);
    });
    expect(mockLoadShoppingCartScripts).toHaveBeenCalledTimes(1);
    expect(mockLoadLoginScripts).toHaveBeenCalledTimes(1);
  });

  it('should handle shopping cart script failure while login succeeds', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Make shopping cart script fail
    const shoppingCartError = new Error('Shopping cart failed to load');
    mockLoadShoppingCartScripts.mockRejectedValue(shoppingCartError);
    mockLoadLoginScripts.mockResolvedValue();

    await decorate(block);
    await new Promise((r) => {
      setTimeout(r, 0);
    });

    expect(mockLoadShoppingCartScripts).toHaveBeenCalledTimes(1);
    expect(mockLoadLoginScripts).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load shopping cart scripts:',
      shoppingCartError,
    );
  });

  it('should handle login script failure while shopping cart succeeds', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Make login script fail
    const loginError = new Error('Login failed to load');
    mockLoadShoppingCartScripts.mockResolvedValue();
    mockLoadLoginScripts.mockRejectedValue(loginError);

    await decorate(block);
    await new Promise((r) => {
      setTimeout(r, 0);
    });

    expect(mockLoadShoppingCartScripts).toHaveBeenCalledTimes(1);
    expect(mockLoadLoginScripts).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load login scripts:',
      loginError,
    );
  });
});
