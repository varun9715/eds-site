import { vi, describe, it, expect, beforeEach } from 'vitest';
import { loadScript, readBlockConfig } from '../../scripts/aem.js';
import { fetchLanguagePlaceholders, getPathDetails } from '../../scripts/scripts.js';
import decorate, { loadLoginScripts } from './login.js';

// Mock the imported functions
vi.mock('../../scripts/aem.js', () => ({
  loadScript: vi.fn(() => Promise.resolve()),
  readBlockConfig: vi.fn(),
}));

vi.mock('../../scripts/scripts.js', () => ({
  fetchLanguagePlaceholders: vi.fn(),
  getPathDetails: vi.fn(),
}));

describe('Login Widget', () => {
  let block;

  beforeEach(() => {
    vi.clearAllMocks();

    readBlockConfig.mockReturnValue({
      includebusinessrewardslogin: 'true',
      loginloadingpageurl: '/loading',
      businessrewardslinknewaccounturl: '/new-account',
    });
    getPathDetails.mockReturnValue({
      lang: 'en',
      region: 'au',
      langRegion: 'en-au',
    });
    fetchLanguagePlaceholders.mockResolvedValue({});

    document.body.innerHTML = `<div class="login-widget block">
      <div>
        <div>includeBusinessRewardsLogin</div>
        <div>true</div>
      </div>
      <div>
        <div>loginLoadingPageUrl</div>
        <div>/loading</div>
      </div>
      <div>
        <div>businessRewardsLinkNewAccountUrl</div>
        <div>/new-account</div>
      </div>
    </div>`;

    block = document.querySelector('.login-widget');

    // Inject mock eds_config
    global.window.eds_config = {
      widgets: {
        login: {
          oauthInitBundleUri:
            'https://test.domain.com/appcache/qfa-qff-oauth-login/master/0.0.0/oauth.js',
          oauthBundleUri:
            'https://test.domain.com/appcache/qdd-oauth-login/master/0.0.0/bundle.js',
          oauthLoginRibbonBundleUri:
            'https://test.domain.com/appcache/qdd-login-ribbon/master/0.0.0/bundle.js',
        },
      },
    };
  });

  it('should not load widget if already loaded', async () => {
    block.classList.add('widget-is-loaded');
    await decorate(block);
    expect(readBlockConfig).not.toHaveBeenCalled();
    expect(loadScript).not.toHaveBeenCalled();
  });

  it('should load widget with correct configuration', async () => {
    await decorate(block);
    expect(readBlockConfig).toHaveBeenCalledWith(block);
    expect(block.classList.contains('widget')).toBe(true);
    expect(block.classList.contains('widget-is-loaded')).toBe(true);
  });

  it('should load required scripts', async () => {
    await loadLoginScripts();
    expect(loadScript).toHaveBeenCalledTimes(3);
    expect(loadScript).toHaveBeenCalledWith(
      'https://test.domain.com/appcache/qfa-qff-oauth-login/master/0.0.0/oauth.js',
      { async: '' },
    );
    expect(loadScript).toHaveBeenCalledWith(
      'https://test.domain.com/appcache/qdd-oauth-login/master/0.0.0/bundle.js',
      { defer: '' },
    );
    expect(loadScript).toHaveBeenCalledWith(
      'https://test.domain.com/appcache/qdd-login-ribbon/master/0.0.0/bundle.js',
      { defer: '' },
    );
  });

  it('should create login ribbon host div', async () => {
    await decorate(block);
    const loginRibbonHost = block.querySelector('.qdd-login-ribbon-host');
    expect(loginRibbonHost).toBeTruthy();
    expect(loginRibbonHost.getAttribute('data-widget-host')).toBe('qdd-login-ribbon');
  });

  it('should inject login dialog script with correct configuration', async () => {
    await decorate(block);

    expect(window.loginDialog).toBeTruthy();

    const { model, ui } = window.loginDialog;

    // Validate model config
    expect(model.includeBusinessRewardsLogin).toBe(true);
    expect(model.loginLoadingPageUrl).toBe('/loading');
    expect(model.businessRewardsLinkNewAccountUrl).toBe('/new-account');

    // Validate URIs
    expect(model.oauthInitBundleUri).toBe(
      'https://test.domain.com/appcache/qfa-qff-oauth-login/master/0.0.0/oauth.js',
    );
    expect(model.oauthBundleUri).toBe(
      'https://test.domain.com/appcache/qdd-oauth-login/master/0.0.0/bundle.js',
    );
    expect(model.oauthLoginRibbonBundleUri).toBe(
      'https://test.domain.com/appcache/qdd-login-ribbon/master/0.0.0/bundle.js',
    );

    expect(model.frequentFlyerLoginUri).toBe('/au/en/frequent-flyer/my-account.html');
    expect(model.frequentFlyerHomeUri).toBe('/au/en/frequent-flyer/my-account.html');
    expect(model.dologinUri).toBe('/au/en/frequent-flyer/my-account.html');
    expect(model.frequentFlyerPointsUri).toBe(
      '/au/en/frequent-flyer/my-account/points-activity.html',
    );
    expect(model.frequentFlyerBookingUri).toBe(
      '/au/en/frequent-flyer/my-account/bookings.html',
    );
    expect(model.frequentFlyerProfileUri).toBe(
      '/au/en/frequent-flyer/my-account/profile.html',
    );
    expect(model.frequentFlyerJoinUri).toBe(
      '/au/en/frequent-flyer/discover-and-join/join.html',
    );
    expect(model.frequentFlyerStatusUri).toBe(
      'https://www.qantas.com/travel/airlines/flight-search/global/en',
    );

    // Validate default UI labels
    expect(ui.ribbonLoginLabel).toBe('Log in');
    expect(ui.ribbonCloseLabel).toBe('Close');
    expect(ui.frequentFlyerLoginLabel).toBe('Frequent Flyer login');
    expect(ui.frequentFlyerHomeLabel).toBe('My account');
    expect(ui.frequentFlyerPointsLabel).toBe('My activity statement');
    expect(ui.frequentFlyerStatusLabel).toBe('Make a Reward booking');
    expect(ui.frequentFlyerBookingsLabel).toBe('My bookings');
    expect(ui.frequentFlyerProfileLabel).toBe('My profile');
    expect(ui.businessRewardsLoginLabel).toBe('Business Rewards login');
    expect(ui.businessRewardsLabel).toBe('Business Rewards');
    expect(ui.businessRewardsLinkNewAccountLabel).toBe('Connect your account');
  });
});
