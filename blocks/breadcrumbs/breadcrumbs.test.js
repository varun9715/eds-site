import { describe, it, expect, vi, beforeEach } from 'vitest';
import decorate from './breadcrumbs.js';

vi.mock('../../scripts/scripts.js', () => ({
  getPathDetails: vi.fn(() => ({
    langRegion: 'en-au',
    prefix: '',
    suffix: '',
    isContentPath: false,
    lang: 'en',
    region: 'au',
  })),
  getLink: vi.fn((path) => `https://www.qantas.com${path}`),
  getEDSLink: vi.fn((path) => `https://www.qantas.com${path}`),
}));

describe('Breadcrumbs Block', () => {
  let block;

  beforeEach(() => {
    document.body.innerHTML = '<div class="breadcrumbs"></div>';
    block = document.querySelector('.breadcrumbs');

    // Clear any schema
    const existing = document.getElementById('breadcrumb-schema');
    if (existing) existing.remove();

    // Default fetch mock
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            currentPage: {
              pagePath: '/en-au/about-us/our-company',
              'jcr:title': 'Our Company',
            },
            parent: {
              pagePath: '/en-au/about-us',
              'jcr:title': 'About Us',
              parent: {
                pagePath: '/en-au',
                'jcr:title': 'Home',
              },
            },
          }),
      }),
    );
  });

  it('renders a standard breadcrumb trail', async () => {
    await decorate(block);
    const items = block.querySelectorAll('ol.breadcrumb li');
    expect(items).toHaveLength(3);
    expect(items[0].textContent.trim()).toBe('Home');
    expect(items[1].textContent.trim()).toBe('About Us');
    expect(items[2].textContent.trim()).toBe('Our Company');
  });

  it('skips hidden breadcrumbs', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            currentPage: {
              pagePath: '/en-au/about-us/our-company',
              'jcr:title': 'Our Company',
            },
            parent: {
              pagePath: '/en-au/about-us',
              'jcr:title': 'About Us',
              hidebreadcrumb: true,
              parent: { pagePath: '/en-au', 'jcr:title': 'Home' },
            },
          }),
      }),
    );

    await decorate(block);
    const items = block.querySelectorAll('ol.breadcrumb li');
    expect(items).toHaveLength(2);
    expect(items[0].textContent.trim()).toBe('Home');
    expect(items[1].textContent.trim()).toBe('Our Company');
  });

  it('handles missing jcr:title gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            currentPage: {
              pagePath: '/en-au/about-us/our-company',
              'jcr:title': 'Our Company',
            },
            parent: {
              pagePath: '/en-au/about-us',
              parent: { pagePath: '/en-au', 'jcr:title': 'Home' },
            },
          }),
      }),
    );

    await decorate(block);
    const items = block.querySelectorAll('ol.breadcrumb li');
    expect(items).toHaveLength(2);
    expect(items[0].textContent.trim()).toBe('Home');
    expect(items[1].textContent.trim()).toBe('Our Company');
  });

  it('injects schema JSON-LD', async () => {
    await decorate(block);
    const schema = document.querySelector('#breadcrumb-schema');
    expect(schema).not.toBeNull();
    const json = JSON.parse(schema.textContent);
    expect(json['@type']).toBe('BreadcrumbList');
    expect(json.itemListElement).toHaveLength(3);
  });

  it('handles fetch failure gracefully', async () => {
    console.error = vi.fn();
    global.fetch = vi.fn(() => Promise.reject(new Error('fail')));
    await decorate(block);
    expect(console.error).toHaveBeenCalledWith(
      'Breadcrumb fetch error:',
      expect.any(Error),
    );
  });

  it('stops traversing when reaching root', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            currentPage: {
              pagePath: '/en-au',
              'jcr:title': 'Home',
              pageDepth: 2,
            },
          }),
      }),
    );
    await decorate(block);
    const items = block.querySelectorAll('ol.breadcrumb li');
    expect(items).toHaveLength(1);
    expect(items[0].textContent.trim()).toBe('Home');
  });

  it('injects schema JSON-LD', async () => {
    window.history.pushState({}, '', '/en-au/about-us/our-company');

    await decorate(block);

    const schemaScript = document.querySelector('script#breadcrumb-schema');
    expect(schemaScript).not.toBeNull();

    const schemaData = JSON.parse(schemaScript.textContent);

    expect(schemaData['@context']).toBe('https://schema.org');
    expect(schemaData['@type']).toBe('BreadcrumbList');
    expect(schemaData.itemListElement).toHaveLength(3);

    // Verify first item (Home)
    expect(schemaData.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.qantas.com/en-au',
    });

    // Verify middle item (About Us)
    expect(schemaData.itemListElement[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: 'About Us',
      item: 'https://www.qantas.com/en-au/about-us',
    });

    // Verify last item (Our Company) – should NOT have item property
    expect(schemaData.itemListElement[2]).toEqual({
      '@type': 'ListItem',
      position: 3,
      name: 'Our Company',
    });
  });
});
