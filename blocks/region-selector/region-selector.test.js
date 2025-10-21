import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import decorate from './region-selector.js';
import { fetchLanguagePlaceholders } from '../../scripts/scripts.js';

// Mock the imported modules

vi.mock('../../scripts/scripts.js', () => ({
  fetchLanguagePlaceholders: vi.fn(),
}));

vi.mock('../../scripts/aem.js', () => ({
  fetchPlaceholders: vi.fn(),
}));

describe('Region Selector Component', () => {
  let block;
  const mockPlaceholders = {
    regionSelectorCountryCode: 'US',
    regionSelectorLanguageCode: 'EN',
    regionSelectorFlag: 'us-flag',
    regionSelectorSr: 'Region selector',
    regionSelectorFull: 'United States - English',
  };

  beforeEach(() => {
    window.hlx = {
      codeBasePath: '/test-path',
    };
    // Reset mocks
    vi.resetAllMocks();

    // Setup document and create elements
    block = document.createElement('div');
    const anchor = document.createElement('a');
    anchor.textContent = 'Initial Text';
    anchor.title = 'Initial Title';
    block.appendChild(anchor);

    // Setup mocks
    fetchLanguagePlaceholders.mockResolvedValue(mockPlaceholders);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete window.hlx;
  });

  it('should decorate the region selector correctly', async () => {
    await decorate(block);

    // Check fetchPlaceholders was called correctly
    expect(fetchLanguagePlaceholders).toHaveBeenCalledWith();

    // Get the decorated anchor
    const anchor = block.querySelector('.region-selector-anchor');
    expect(anchor).not.toBeNull();

    // Verify anchor attributes
    expect(anchor.title).toBe('');
    expect(anchor.textContent).not.toBe('Initial Text');
    expect(anchor.getAttribute('aria-labelledby')).toBe('regionSelector');

    // Verify created elements
    const screenReaderTxt = anchor.querySelector('.visually-hidden');
    expect(screenReaderTxt).not.toBeNull();
    expect(screenReaderTxt.id).toBe('regionSelector');

    const flagSpan = anchor.querySelector('.flag');
    expect(flagSpan).not.toBeNull();
    expect(flagSpan.getAttribute('aria-hidden')).toBe('true');

    const flagImg = flagSpan.querySelector('img');
    expect(flagImg).not.toBeNull();
    expect(flagImg.src).toContain('/icons/us-flag.svg');
    expect(flagImg.alt).toBe('');

    const regionSpan = anchor.querySelector('.region-label');
    expect(regionSpan).not.toBeNull();
    expect(regionSpan.getAttribute('aria-hidden')).toBe('true');
  });

  it('should handle case when anchor is not present', async () => {
    // Empty block with no anchor
    block.innerHTML = '';

    await decorate(block);

    expect(block.innerHTML).toBe('');
  });

  it('should handle case when fetchLanguagePlaceholders returns null', async () => {
    fetchLanguagePlaceholders.mockResolvedValue(null);

    await decorate(block);

    // No modifications should be made to the anchor
    const anchor = block.querySelector('a');
    expect(anchor.textContent).toBe('Initial Text');
    expect(anchor.title).toBe('Initial Title');
  });

  it('should handle case when fetchLanguagePlaceholders throws an error', async () => {
    fetchLanguagePlaceholders.mockRejectedValue(new Error('Fetch error'));

    // Errors should be caught within the decorate function
    await expect(decorate(block)).rejects.toThrow('Fetch error');

    // No modifications should be made to the anchor
    const anchor = block.querySelector('a');
    expect(anchor.textContent).toBe('Initial Text');
    expect(anchor.title).toBe('Initial Title');
  });

  it('should handle empty placeholder values', async () => {
    // Add anchor to the block
    const originalHref = '/region-selection';
    block.innerHTML = `<a href="${originalHref}">Region Selector</a>`;

    // Mock placeholder response with empty values
    fetchLanguagePlaceholders.mockResolvedValueOnce({
      regionSelectorCountryCode: '',
      regionSelectorLanguageCode: '',
      regionSelectorFlag: '',
      screenReaderText: '',
      regionSelectorFull: '',
    });

    await decorate(block);

    // Check if the original anchor is still there or if it was replaced
    const anchor = block.querySelector('a');

    if (!anchor) {
      // Test passes if decoration removed/didn't create elements with empty values
      expect(block.innerHTML).toBe('');
    } else {
      // If the anchor exists, ensure it doesn't have null children
      expect(anchor).not.toBeNull();

      // We now check if the flag elements exist before trying to access them
      const flagSpan = anchor.querySelector('.flag');
      if (flagSpan) {
        const flagImg = flagSpan.querySelector('img');
        if (flagImg) {
          // If image exists, its src should contain the empty flag value
          expect(flagImg.getAttribute('src')).toContain('/icons/.svg');
        }
      }

      // We should be safe to check the href in any case
      expect(anchor.getAttribute('href')).toBe(originalHref);
    }

    // Verify the placeholders were fetched without path
    expect(fetchLanguagePlaceholders).toHaveBeenCalledWith();
  });

  it('should clear the block content before appending the decorated anchor', async () => {
    // Add some extra content to the block
    const extraDiv = document.createElement('div');
    extraDiv.textContent = 'Extra content';
    block.appendChild(extraDiv);

    await decorate(block);

    // Block should only contain the decorated anchor
    expect(block.childElementCount).toBe(1);
    expect(block.querySelector('.region-selector-anchor')).not.toBeNull();
    expect(block.textContent).not.toContain('Extra content');
  });
});
