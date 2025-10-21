import { describe, it, expect, beforeEach, vi } from 'vitest';
import decorate from './cta-link.js';

// Mock the window.digitalDataLayer
const mockDigitalDataLayer = {
  push: vi.fn(),
};

// Mock the attachTestId function
vi.mock('../../scripts/utils/common-utils.js', () => ({
  attachTestId: vi.fn(() => {}),
}));

describe('CTA Link Block', () => {
  let block;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup window.digitalDataLayer mock
    global.window = {
      digitalDataLayer: mockDigitalDataLayer,
    };

    // Create a fresh block for each test
    block = document.createElement('div');
    block.classList.add('cta-link');
  });

  it('should create primary link with correct attributes', () => {
    block.innerHTML = `
      <div>first-cta-primary</div>
      <div><a href="https://qantas.com">Primary Link</a></div>
      <div>Primary link description</div>
      <div>utm_source</div>
      <div>storybook</div>
      <div>TEST_CAMPAIGN</div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    `;

    decorate(block);

    const link = block.querySelector('a.button.primary');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('https://qantas.com?utm_source=storybook');
    expect(link.innerText).toBe('Primary Link');
    expect(link.getAttribute('aria-label')).toBe('Primary link description');
    expect(link.getAttribute('data-wae-event')).toBe('link_click');
    expect(link.getAttribute('data-wae-internal-campaign-id')).toBe('TEST_CAMPAIGN');
  });

  it('should create secondary link with correct attributes', () => {
    block.innerHTML = `
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div><a href="https://qantas.com/help">Secondary Link</a></div>
      <div>Secondary link description</div>
      <div>utm_medium</div>
      <div>storybook</div>
      <div>TEST_CAMPAIGN_2</div>
    `;

    decorate(block);

    const link = block.querySelector('a.button.secondary');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe(
      'https://qantas.com/help?utm_medium=storybook',
    );
    expect(link.innerText).toBe('Secondary Link');
    expect(link.getAttribute('aria-label')).toBe('Secondary link description');
    expect(link.getAttribute('data-wae-event')).toBe('link_click');
    expect(link.getAttribute('data-wae-internal-campaign-id')).toBe('TEST_CAMPAIGN_2');
  });

  it('should create both primary and secondary links', () => {
    block.innerHTML = `
      <div>first-cta-primary</div>
      <div><a href="https://qantas.com">Primary Link</a></div>
      <div>Primary link description</div>
      <div>utm_source</div>
      <div>storybook</div>
      <div>TEST_CAMPAIGN</div>
      <div><a href="https://qantas.com/help">Secondary Link</a></div>
      <div>Secondary link description</div>
      <div>utm_medium</div>
      <div>storybook</div>
      <div>TEST_CAMPAIGN_2</div>
    `;

    decorate(block);

    const links = block.querySelectorAll('a.button');
    expect(links.length).toBe(2);
    expect(links[0].classList.contains('primary')).toBe(true);
    expect(links[1].classList.contains('secondary')).toBe(true);
  });

  it('should handle external links correctly', () => {
    block.innerHTML = `
      <div>first-cta-primary</div>
      <div><a href="https://external-site.com">External Link</a></div>
      <div>External link description</div>
      <div></div>
      <div></div>
      <div>TEST_CAMPAIGN</div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    `;

    decorate(block);

    const link = block.querySelector('a.button');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('https://external-site.com');
  });

  it('should handle relative link correctly in author mode', () => {
    block.innerHTML = `
      <div>first-cta-primary</div>
      <div><a href="/content/qcom/en-au/about-us">Primary Link</a></div>
      <div>Primary link description</div>
      <div>utm_source</div>
      <div>storybook</div>
      <div>TEST_CAMPAIGN</div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    `;

    decorate(block);

    const link = block.querySelector('a.button.primary');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe(
      '/content/qcom/en-au/about-us?utm_source=storybook',
    );
    expect(link.innerText).toBe('Primary Link');
    expect(link.getAttribute('aria-label')).toBe('Primary link description');
    expect(link.getAttribute('data-wae-event')).toBe('link_click');
    expect(link.getAttribute('data-wae-internal-campaign-id')).toBe('TEST_CAMPAIGN');
  });

  it('should handle relative link correctly in live mode', () => {
    block.innerHTML = `
      <div>first-cta-primary</div>
      <div><a href="/en-au/about-us">Primary Link</a></div>
      <div>Primary link description</div>
      <div>utm_source</div>
      <div>storybook</div>
      <div>TEST_CAMPAIGN</div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    `;

    decorate(block);

    const link = block.querySelector('a.button.primary');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('/en-au/about-us?utm_source=storybook');
    expect(link.innerText).toBe('Primary Link');
    expect(link.getAttribute('aria-label')).toBe('Primary link description');
    expect(link.getAttribute('data-wae-event')).toBe('link_click');
    expect(link.getAttribute('data-wae-internal-campaign-id')).toBe('TEST_CAMPAIGN');
  });

  it('should push correct data to digitalDataLayer on click', async () => {
    block.innerHTML = `
      <div>first-cta-primary</div>
      <div><a href="https://qantas.com">Test Link</a></div>
      <div></div>
      <div></div>
      <div></div>
      <div>TEST_CAMPAIGN</div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    `;

    decorate(block);

    const link = block.querySelector('a.button');
    // Create and dispatch a click event instead of calling click()
    const clickEvent = new Event('click', {
      bubbles: true,
      cancelable: true,
    });
    link.dispatchEvent(clickEvent);
    await vi.waitFor(() => {
      if (mockDigitalDataLayer.push.mock.calls.length === 0) {
        throw new Error('waitFor link_click');
      }
    });

    expect(mockDigitalDataLayer.push).toHaveBeenCalledWith({
      event: 'link_click',
      details: {
        link_text: 'Test Link',
        link_url: 'https://qantas.com/',
        link_type: 'INTERNAL',
        internal_campaign_id: 'TEST_CAMPAIGN',
        module: 'CTA Link',
      },
    });
  });

  it('should handle query parameters correctly', () => {
    block.innerHTML = `
      <div>first-cta-primary</div>
      <div><a href="https://qantas.com">Test Link</a></div>
      <div></div>
      <div>source</div>
      <div>test</div>
      <div>TEST_CAMPAIGN</div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    `;

    decorate(block);

    const link = block.querySelector('a.button');
    expect(link.getAttribute('href')).toBe('https://qantas.com?source=test');
  });

  it('should handle existing query parameters in URL', () => {
    block.innerHTML = `
      <div>first-cta-primary</div>
      <div><a href="https://qantas.com?existing=param">Test Link</a></div>
      <div></div>
      <div>source</div>
      <div>test</div>
      <div>TEST_CAMPAIGN</div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    `;

    decorate(block);

    const link = block.querySelector('a.button');
    expect(link.getAttribute('href')).toBe(
      'https://qantas.com?existing=param&source=test',
    );
  });

  // New tests for style options
  it('should apply fill-container style correctly', () => {
    block.innerHTML = `
      <div>fill-container</div>
      <div><a href="https://qantas.com">Test Link</a></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    `;

    decorate(block);

    const link = block.querySelector('a.button');
    expect(link.classList.contains('fill-container')).toBe(true);
  });

  it('should apply hug-content style correctly', () => {
    block.innerHTML = `
      <div>hug-content</div>
      <div><a href="https://qantas.com">Test Link</a></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    `;

    decorate(block);

    const link = block.querySelector('a.button');
    expect(link.classList.contains('hug-content')).toBe(true);
  });

  it('should handle multiple style options', () => {
    block.innerHTML = `
      <div>first-cta-primary,fill-container</div>
      <div><a href="https://qantas.com">Test Link</a></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    `;

    decorate(block);

    const link = block.querySelector('a.button');
    expect(link.classList.contains('primary')).toBe(true);
    expect(link.classList.contains('fill-container')).toBe(true);
  });

  it('should handle links without anchor tags (text content only)', () => {
    block.innerHTML = `
      <div>first-cta-primary</div>
      <div>Text Only Link</div>
      <div></div>
      <div></div>
      <div></div>
      <div>TEST_CAMPAIGN</div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    `;

    decorate(block);

    const link = block.querySelector('a.button.primary');
    expect(link).not.toBeNull();
    expect(link.innerText).toBe('Text Only Link');
  });

  it('should not create links when text or href is missing', () => {
    block.innerHTML = `
      <div>first-cta-primary</div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    `;

    decorate(block);

    const links = block.querySelectorAll('a.button');
    expect(links.length).toBe(0);
  });

  it('should apply test IDs to primary and secondary links', async () => {
    block.innerHTML = `
      <div>first-cta-primary</div>
      <div><a href="https://qantas.com">Primary Link</a></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div><a href="https://qantas.com/help">Secondary Link</a></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    `;

    decorate(block);

    // Verify that attachTestId was called for both primary and secondary links
    const { attachTestId } = await import('../../scripts/utils/common-utils.js');
    expect(attachTestId).toHaveBeenCalledTimes(2);
    expect(attachTestId).toHaveBeenCalledWith(
      expect.objectContaining({
        block: expect.any(HTMLElement),
        selector: '.primary',
        elementName: 'primary',
      }),
    );
    expect(attachTestId).toHaveBeenCalledWith(
      expect.objectContaining({
        block: expect.any(HTMLElement),
        selector: '.secondary',
        elementName: 'secondary',
      }),
    );
  });
});
