import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { loadScript } from '../../scripts/aem.js';
import decorate, { loadShoppingCartScripts } from './shopping-cart-widget.js';

const qantasDomain = 'static.qantas.com';
const environment = 'testing';
const widgetURI = 'ams02/a974/62/prod/master/shoppingcart_widget/current/app.js';
const shoppingcartWidgetURL = `https://${qantasDomain}/${widgetURI}`;
const lang = 'en';
const region = 'AU';

vi.mock('../../scripts/aem.js', () => ({
  loadScript: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../scripts/scripts.js', () => ({
  getPathDetails: vi.fn(() => ({
    lang,
    region,
  })),
}));

const createBlock = () => document.createElement('div');

describe('Shopping Cart Widget', () => {
  beforeEach(() => {
    // Mock global config
    window.eds_config = {
      widgets: {
        env: environment,
        shopping_cart: {
          scriptPath: shoppingcartWidgetURL,
        },
      },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    delete window.eds_config;
  });

  it('loads widget and updates block class and content', () => {
    const block = createBlock();
    decorate(block);

    expect(block.innerHTML).toContain('data-widget-type="shoppingcart"');
    expect(block.innerHTML).toContain('<script type="qantas/widget">');
    expect(block.classList.contains('widget-is-loaded')).toBe(true);
  });

  it('does not reload widget if already loaded', () => {
    const block = createBlock();
    block.classList.add('widget-is-loaded');

    decorate(block);

    expect(block.innerHTML).toBe('');
  });

  it('does not inject widget if "hide-shopping-cart" is selected', () => {
    const block = createBlock();
    block.classList.add('hide-shopping-cart');

    decorate(block);

    expect(block.innerHTML).toBe('');
  });

  it('generates correct widget snapshot', () => {
    const block = document.createElement('div');

    decorate(block);

    expect(block.innerHTML).toMatchSnapshot();
  });
});

describe('loadShoppingCartScripts', () => {
  beforeEach(() => {
    window.eds_config = {
      widgets: {
        env: environment,
        shopping_cart: {
          scriptPath: shoppingcartWidgetURL,
        },
      },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete window.eds_config;
  });

  it('loads widget script with correct domain', async () => {
    await loadShoppingCartScripts();
    expect(loadScript).toHaveBeenCalledWith(shoppingcartWidgetURL);
  });

  it('logs error if script path is missing', async () => {
    console.error = vi.fn();
    window.eds_config.widgets.shopping_cart.scriptPath = '';

    await loadShoppingCartScripts();

    expect(console.error).toHaveBeenCalledWith(
      'Shopping cart widget script path not found in eds_config.',
    );
    expect(loadScript).not.toHaveBeenCalled();
  });
});
