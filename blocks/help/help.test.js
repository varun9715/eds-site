import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import decorate from './help.js'; // Adjust import path as needed

describe('decorate function', () => {
  let mockBlock;

  beforeEach(() => {
    // Mock the window.hlx object
    window.hlx = {
      codeBasePath: '/test-path',
    };
    // Set up a fresh mock block before each test
    mockBlock = document.createElement('div');
  });

  afterEach(() => {
    // Clean up
    delete window.hlx;
  });

  it('should return early if block is falsy', () => {
    const result = decorate(null);
    expect(result).toBeUndefined();
  });

  it('should return early if block has no children', () => {
    // Empty div has no children by default
    const result = decorate(mockBlock);
    expect(result).toBeUndefined();
    expect(mockBlock.innerHTML).toBe('');
  });

  it('should return early if any required column is missing', () => {
    // Only has icon column, missing text and url columns
    mockBlock.innerHTML = '<div><a href="/images/icon.svg"></a></div>';
    const originalHTML = mockBlock.innerHTML;

    const result = decorate(mockBlock);
    expect(result).toBeUndefined();
    expect(mockBlock.innerHTML).toBe(originalHTML);
  });

  it('should return early if fewer than 3 columns are present', () => {
    // Only has 2 columns, missing url column
    mockBlock.innerHTML = `
      <div><a href="/images/icon.svg"></a></div>
      <div>Help Text</div>
    `;
    const originalHTML = mockBlock.innerHTML;

    decorate(mockBlock);
    expect(mockBlock.innerHTML).toBe(originalHTML);
  });

  it('should return early if label is empty', () => {
    mockBlock.innerHTML = `
      <div><span>No image here</span></div>
      <div></div>
      <div><a href="https://example.com/help"></a></div>
    `;
    const originalHTML = mockBlock.innerHTML;

    decorate(mockBlock);
    expect(mockBlock.innerHTML).toBe(originalHTML);
  });

  it('should return early if target URL is missing', () => {
    mockBlock.innerHTML = `
      <div><span>No image here</span></div>
      <div>Help Text</div>
      <div></div>
    `;
    const originalHTML = mockBlock.innerHTML;

    decorate(mockBlock);
    expect(mockBlock.innerHTML).toBe(originalHTML);
  });

  it('should return early if URL anchor is missing', () => {
    mockBlock.innerHTML = `
      <div><span>No image here</span></div>
      <div>Help Text</div>
      <div>No anchor here</div>
    `;
    const originalHTML = mockBlock.innerHTML;

    decorate(mockBlock);
    expect(mockBlock.innerHTML).toBe(originalHTML);
  });

  it('should transform a valid block correctly', () => {
    mockBlock.innerHTML = `
      <div><img src="/images/help-icon.svg"></div>
      <div>Get Help</div>
      <div><a href="https://example.com/help"></a></div>
    `;

    decorate(mockBlock);

    const anchor = mockBlock.querySelector('a');
    expect(anchor).not.toBeNull();
    expect(anchor.getAttribute('href')).toBe('https://example.com/help');
    expect(anchor.getAttribute('aria-label')).toBe('Get Help');

    const img = anchor.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('/images/help-icon.svg');
    expect(img.getAttribute('aria-hidden')).toBe('true');

    const span = anchor.querySelector('span');
    expect(span).not.toBeNull();
    expect(span.textContent).toBe('Get Help');
  });

  it('should handle img elements correctly', () => {
    mockBlock.innerHTML = `
      <div><img src="https://cdn.example.com/assets/icons/v2/help-icon.svg?version=1.2"></div>
      <div>Get Help</div>
      <div><a href="https://example.com/help"></a></div>
    `;

    decorate(mockBlock);

    const img = mockBlock.querySelector('img');
    expect(img.getAttribute('src')).toBe(
      'https://cdn.example.com/assets/icons/v2/help-icon.svg?version=1.2',
    );
  });

  it('should preserve spaces in the label text', () => {
    mockBlock.innerHTML = `
      <div><img src="/images/help-icon.svg"></div>
      <div>  Contact Support Team  </div>
      <div><a href="https://example.com/contact"></a></div>
    `;

    decorate(mockBlock);

    const anchor = mockBlock.querySelector('a');
    expect(anchor.getAttribute('aria-label')).toBe('Contact Support Team');

    const span = anchor.querySelector('span');
    expect(span.textContent).toBe('Contact Support Team');
  });
});
