import { describe, it, expect, beforeEach, vi } from 'vitest';
import decorateContainer from './icon-and-text-container.js';

vi.mock('../../scripts/utils/dom.js', () => ({
  createElementWithClasses: (tag, ...classes) => {
    const el = document.createElement(tag);
    el.classList.add(...classes);
    return el;
  },
  getTextContent: (el) => el.textContent || '',
}));

vi.mock('../../scripts/utils/common-utils.js', () => ({
  getFilename: (url) => {
    // Extract filename from URL for testing
    const parts = url.split('/');
    return parts[parts.length - 1] || 'default.png';
  },
  attachTestId: () => {},
  isStandaloneLink: () => {},
  getTitleStyleClass: () => 'title-02',
}));

describe('icon-and-text decorator', () => {
  let block;

  beforeEach(() => {
    document.body.innerHTML = '';
    block = document.createElement('div');

    // Mock window.hlx.codeBasePath
    global.window = global.window || {};
    global.window.hlx = {
      codeBasePath: '/test-path',
    };

    // Mock window.digitalDataLayer for tracking
    global.window.digitalDataLayer = {
      push: vi.fn(),
    };
  });

  it('applies layout classes from single-cell rows', () => {
    const layoutRow = document.createElement('div');
    const span = document.createElement('span');
    span.textContent = 'layout-3-col';
    layoutRow.appendChild(span);
    block.appendChild(layoutRow);

    const item = document.createElement('div');
    const iconDiv = document.createElement('div');
    const img = document.createElement('img');
    img.src = 'https://example.com/icon.png';
    iconDiv.appendChild(img);

    const contentDiv = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = 'Test Title';
    const description = document.createElement('p');
    description.textContent = 'Some description text';
    const linkParagraph = document.createElement('p');
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = 'Link';
    linkParagraph.appendChild(link);

    contentDiv.appendChild(title);
    contentDiv.appendChild(description);
    contentDiv.appendChild(linkParagraph);

    item.appendChild(iconDiv);
    const altText = document.createElement('p');
    altText.textContent = 'alt text';

    const hideAltText = document.createElement('div');
    hideAltText.textContent = '';

    item.appendChild(altText);
    item.appendChild(hideAltText);
    item.appendChild(contentDiv);

    block.appendChild(item);

    decorateContainer(block);

    expect(block.classList.contains('layout-3-col')).toBe(true);
    expect(block.querySelector('.icon-and-text')).toBeTruthy();
    expect(block.querySelector('img')).toBeTruthy();
    expect(block.querySelector('img').alt).toBe('alt text');
    expect(block.querySelector('.title-02').textContent).toBe('Test Title');
    expect(block.querySelector('.icontext-description').textContent).toBe(
      'Some description text',
    );
    expect(block.querySelector('a').classList.contains('standalone')).toBe(false);
    expect(block.querySelector('a').classList.contains('body-01')).toBe(false);
  });

  it('does not render image if icon URL is empty', () => {
    const item = document.createElement('div');
    const iconDiv = document.createElement('div'); // Empty icon div
    const contentDiv = document.createElement('div');

    const title = document.createElement('h3');
    title.textContent = 'No Icon Title';
    const description = document.createElement('p');
    description.textContent = 'Description without image';

    contentDiv.appendChild(title);
    contentDiv.appendChild(description);

    item.appendChild(iconDiv);
    const altText = document.createElement('p');
    altText.textContent = 'alt text';

    const hideAltText = document.createElement('div');
    hideAltText.textContent = '';

    item.appendChild(altText);
    item.appendChild(hideAltText);
    item.appendChild(contentDiv);

    block.appendChild(item);

    decorateContainer(block);

    expect(block.querySelector('img')).toBeNull();
    expect(block.querySelector('.title-02').textContent).toBe('No Icon Title');
    expect(block.querySelector('.icontext-description').textContent).toBe(
      'Description without image',
    );
  });

  it('hides alt text if hideAltText is true', () => {
    const layoutRow = document.createElement('div');
    const span = document.createElement('span');
    span.textContent = 'layout-3-col';
    layoutRow.appendChild(span);
    block.appendChild(layoutRow);

    const item = document.createElement('div');
    const iconDiv = document.createElement('div');
    const img = document.createElement('img');
    img.src = 'https://example.com/icon.png';
    iconDiv.appendChild(img);

    const contentDiv = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = 'Test Title';
    const description = document.createElement('p');
    description.textContent = 'Some description text';
    const linkParagraph = document.createElement('p');
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = 'Link';
    linkParagraph.appendChild(link);

    contentDiv.appendChild(title);
    contentDiv.appendChild(description);
    contentDiv.appendChild(linkParagraph);

    item.appendChild(iconDiv);
    const altText = document.createElement('p');
    altText.textContent = 'alt text';

    const hideAltText = document.createElement('div');
    hideAltText.textContent = 'true';

    item.appendChild(altText);
    item.appendChild(hideAltText);
    item.appendChild(contentDiv);

    block.appendChild(item);

    decorateContainer(block);

    expect(block.querySelector('img').alt).toBe('');
  });

  it('does not render links container if no anchor tags present', () => {
    const item = document.createElement('div');
    const iconDiv = document.createElement('div');
    const img = document.createElement('img');
    img.src = 'https://example.com/icon.png';
    iconDiv.appendChild(img);

    const contentDiv = document.createElement('div');

    const title = document.createElement('h4');
    title.textContent = 'No CTA';
    const description = document.createElement('p');
    description.textContent = 'Content only';

    contentDiv.appendChild(title);
    contentDiv.appendChild(description);

    item.appendChild(iconDiv);
    const altText = document.createElement('p');
    altText.textContent = 'alt text';

    const hideAltText = document.createElement('div');
    hideAltText.textContent = '';

    item.appendChild(altText);
    item.appendChild(hideAltText);
    item.appendChild(contentDiv);

    block.appendChild(item);

    decorateContainer(block);

    expect(block.querySelector('.icontext-links-container')).toBeNull();
  });

  it('adds multiple CTA links correctly', () => {
    const item = document.createElement('div');
    const iconDiv = document.createElement('div');
    const img = document.createElement('img');
    img.src = 'https://example.com/icon.png';
    iconDiv.appendChild(img);

    const contentDiv = document.createElement('div');

    const title = document.createElement('h3');
    title.textContent = 'Multiple Links';
    const description = document.createElement('p');
    description.textContent = 'More text';

    const linkParagraph1 = document.createElement('p');
    const link1 = document.createElement('a');
    link1.href = '#1';
    link1.textContent = 'Link1';
    linkParagraph1.appendChild(link1);

    const linkParagraph2 = document.createElement('p');
    const link2 = document.createElement('a');
    link2.href = '#2';
    link2.textContent = 'Link2';
    linkParagraph2.appendChild(link2);

    contentDiv.appendChild(title);
    contentDiv.appendChild(description);
    contentDiv.appendChild(linkParagraph1);
    contentDiv.appendChild(linkParagraph2);

    item.appendChild(iconDiv);
    const altText = document.createElement('p');
    altText.textContent = 'alt text';

    const hideAltText = document.createElement('div');
    hideAltText.textContent = '';

    item.appendChild(altText);
    item.appendChild(hideAltText);
    item.appendChild(contentDiv);

    block.appendChild(item);

    decorateContainer(block);
  });
});
