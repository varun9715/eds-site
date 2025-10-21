import { describe, it, expect, beforeEach, vi } from 'vitest';
import decorate from './logo.js';

// Import the mocked module
import { getTextContent } from '../../scripts/utils/dom.js';

// Mock the getTextContent function - must be at top level
vi.mock('../../scripts/utils/dom.js', () => ({
  getTextContent: vi.fn(),
}));

// Mock the global window object
const mockWindow = {
  hlx: {
    codeBasePath: '/test-base-path',
  },
};

describe('decorate function', () => {
  beforeEach(() => {
    // Setup window mock before each test
    global.window = mockWindow;

    // Reset the DOM between tests
    document.body.innerHTML = '';

    // Reset mocks
    vi.mocked(getTextContent).mockReset();
  });

  it('should return early if block is null', () => {
    const result = decorate(null);
    expect(result).toBeUndefined();
  });

  it('should return early if block has insufficient children', () => {
    const block = document.createElement('div');
    const iconCol = document.createElement('div');
    block.appendChild(iconCol);

    const result = decorate(block);

    expect(result).toBeUndefined();
    expect(block.innerHTML).toBe('<div></div>');
  });

  it('should return early if missing icon column', () => {
    const block = document.createElement('div');
    const urlCol = document.createElement('div');
    block.appendChild(urlCol);

    const result = decorate(block);

    expect(result).toBeUndefined();
    expect(block.innerHTML).toBe('<div></div>');
  });

  it('should return early if missing url column', () => {
    const block = document.createElement('div');
    const iconCol = document.createElement('div');
    block.appendChild(iconCol);

    const result = decorate(block);

    expect(result).toBeUndefined();
    expect(block.innerHTML).toBe('<div></div>');
  });

  it('should create logo with existing image when img element exists', () => {
    const block = document.createElement('div');
    const iconCol = document.createElement('div');
    const urlCol = document.createElement('div');

    // Create existing image
    const imgEl = document.createElement('img');
    imgEl.src = 'existing-image.svg';
    iconCol.appendChild(imgEl);

    // Create URL anchor
    const urlAnchor = document.createElement('a');
    urlAnchor.href = 'https://example.com';
    urlCol.appendChild(urlAnchor);

    block.appendChild(iconCol);
    block.appendChild(urlCol);

    vi.mocked(getTextContent).mockReturnValue('Example Logo');

    decorate(block);

    // Should wrap the image in a link
    expect(block.innerHTML).toContain('<a href="https://example.com/">');
    expect(block.innerHTML).toContain(
      '<img src="existing-image.svg" alt="Example Logo">',
    );
    expect(block.innerHTML).toContain('</a>');
  });

  it('should create empty link when no img element exists', () => {
    const block = document.createElement('div');
    const iconCol = document.createElement('div');
    const urlCol = document.createElement('div');

    // Create icon anchor with href (but no img element)
    const iconAnchor = document.createElement('a');
    iconAnchor.href = 'https://example.com/icons/logo.svg';
    iconCol.appendChild(iconAnchor);

    // Create URL anchor
    const urlAnchor = document.createElement('a');
    urlAnchor.href = 'https://example.com/logo.svg';
    urlCol.appendChild(urlAnchor);

    block.appendChild(iconCol);
    block.appendChild(urlCol);

    vi.mocked(getTextContent).mockReturnValue('Example Logo');

    decorate(block);

    // Should create empty link since no img element exists
    expect(block.innerHTML).toBe('<a href="https://example.com/logo.svg"></a>');
  });

  it('should use default href when anchor has no href', () => {
    const block = document.createElement('div');
    const iconCol = document.createElement('div');
    const urlCol = document.createElement('div');

    // Create icon anchor with href (but no img element)
    const iconAnchor = document.createElement('a');
    iconAnchor.href = 'https://example.com/icons/default.svg';
    iconCol.appendChild(iconAnchor);

    // Create URL anchor without href
    const urlAnchor = document.createElement('a');
    urlCol.appendChild(urlAnchor);

    block.appendChild(iconCol);
    block.appendChild(urlCol);

    vi.mocked(getTextContent).mockReturnValue('Example Logo');

    decorate(block);

    // Should use empty href when no href is provided
    expect(block.innerHTML).toBe('<a href=""></a>');
  });

  it('should use empty alt text when getTextContent returns null', () => {
    const block = document.createElement('div');
    const iconCol = document.createElement('div');
    const urlCol = document.createElement('div');

    // Create existing image
    const imgEl = document.createElement('img');
    imgEl.src = 'existing-image.svg';
    iconCol.appendChild(imgEl);

    // Create URL anchor
    const urlAnchor = document.createElement('a');
    urlAnchor.href = 'https://example.com/logo.svg';
    urlCol.appendChild(urlAnchor);

    block.appendChild(iconCol);
    block.appendChild(urlCol);

    vi.mocked(getTextContent).mockReturnValue(null);

    decorate(block);

    // Should use empty alt text
    expect(block.innerHTML).toContain('<img src="existing-image.svg" alt="">');
  });

  it('should handle case when no URL anchor exists', () => {
    const block = document.createElement('div');
    const iconCol = document.createElement('div');
    const urlCol = document.createElement('div');

    // Create existing image
    const imgEl = document.createElement('img');
    imgEl.src = 'existing-image.svg';
    iconCol.appendChild(imgEl);

    // urlCol has no anchor element

    block.appendChild(iconCol);
    block.appendChild(urlCol);

    vi.mocked(getTextContent).mockReturnValue('Example Logo');

    decorate(block);

    // Should use default href and alt text from getTextContent
    expect(block.innerHTML).toBe(
      '<a href="#"><img src="existing-image.svg" alt="Example Logo"></a>',
    );
  });

  it('should handle case when URL anchor exists but has no href', () => {
    const block = document.createElement('div');
    const iconCol = document.createElement('div');
    const urlCol = document.createElement('div');

    // Create existing image
    const imgEl = document.createElement('img');
    imgEl.src = 'existing-image.svg';
    iconCol.appendChild(imgEl);

    // Create URL anchor without href
    const urlAnchor = document.createElement('a');
    urlCol.appendChild(urlAnchor);

    block.appendChild(iconCol);
    block.appendChild(urlCol);

    vi.mocked(getTextContent).mockReturnValue('Example Logo');

    decorate(block);

    // Should use empty href when anchor exists but has no href
    expect(block.innerHTML).toBe(
      '<a href=""><img src="existing-image.svg" alt="Example Logo"></a>',
    );
  });
});
