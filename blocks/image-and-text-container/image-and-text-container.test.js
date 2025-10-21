import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElementFromHTML, getByTestId } from '../../scripts/vitest/vitest-utils.js';
import * as damApis from '../../scripts/utils/dam-open-apis.js';
import decorate from './image-and-text-container.js';

vi.mock('../../scripts/scripts.js', () => ({
  getEDSLink: vi.fn((path) => {
    // If it's already an absolute URL, return it as-is
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    // Otherwise, prepend domain
    return `https://www.qantas.com${path}`;
  }),
  isEDSLink: vi.fn(async (path) => path.includes('/content/qcom')),
}));

describe('Image and Text Block', () => {
  const section = document.createElement('div');
  let containerBlock;
  let itemTemplate;

  beforeEach(() => {
    // Set up mock DOM block
    document.body.innerHTML = '';
    containerBlock = document.createElement('div');
    containerBlock.classList.add('image-and-text-container');
    section.appendChild(containerBlock);

    const containerConfig = [
      createElementFromHTML(`
        <div data-testid="columns">
          <div>layout-1-col</div>
        </div>`),
      createElementFromHTML(
        `<div data-testid="imageAlignment">
          <div>all-left-aligned</div>
        </div>`,
      ),
      createElementFromHTML(
        `<div data-testid="firstArticleHighlighted">
          <div></div>
        </div>`,
      ),
      createElementFromHTML('<div data-testid="disableImageCurve"><div></div></div>'),
    ];
    containerConfig.forEach((config) => containerBlock.appendChild(config));

    itemTemplate = document.createElement('div');
    const itemChildren = [
      createElementFromHTML(`
        <div data-testid="image">
          <a href="https://link.com" title="Alternative Text">https://link.com</a>
        </div>`),
      createElementFromHTML('<div data-testid="hideAltText"></div>'),
      createElementFromHTML(
        '<div data-testid="caption">Enter caption / credit / location here</div>',
      ),
      createElementFromHTML('<div data-testid="ribbon">Label</div>'),
      createElementFromHTML('<div data-testid="category">Category</div>'),
      createElementFromHTML(`
        <div data-testid="title">
          <h3 id="enter-your-title-here">Enter your title here</h3>
        </div>`),
      createElementFromHTML(
        '<div data-testid="introText">Enter your intro text here</div>',
      ),
      createElementFromHTML(
        '<div data-testid="bodyText"><p>Enter your body text here</p></div>',
      ),
      createElementFromHTML(
        `<div>
          <p><a href="https://qantas.com/link1">cta1Text</a></p>
          <p><a href="https://qantas.com/link2">cta2Text</a></p>
          <p><a href="https://qantas.com/link3">cta3Text</a></p>
        </div>`,
      ),
      createElementFromHTML('<div data-testid="campaignCode">campaign_code</div>'),
    ];

    itemChildren.forEach((child) => itemTemplate.appendChild(child));

    // Mocks
    const mockImage = document.createElement('picture');
    vi.spyOn(damApis, 'dynamicMediaToPictureTag').mockResolvedValue(mockImage);
  });

  it('should match the rendered snapshot', async () => {
    containerBlock.appendChild(itemTemplate.cloneNode(true));
    await decorate(containerBlock);
    expect(section.innerHTML).toMatchSnapshot();
  });

  it('should use the correct Heading Tag for Title according to the Heading Style', async () => {
    const item = itemTemplate.cloneNode(true);
    getByTestId(item, 'title').innerHTML = '<h2 id="new-title">New Title</h2>';
    containerBlock.appendChild(item);
    await decorate(containerBlock);
    expect(containerBlock.querySelector('.imagetext-title').tagName).toBe('H2');
  });

  it('should add the checkbox field values in the container classlist', async () => {
    getByTestId(containerBlock, 'firstArticleHighlighted').innerHTML =
      '<div>first-article-highlighted</div>';

    getByTestId(containerBlock, 'disableImageCurve').innerHTML =
      '<div>image-curve-disabled</div>';

    await decorate(containerBlock);
    expect(containerBlock.classList.contains('first-article-highlighted')).toBe(true);
    expect(containerBlock.classList.contains('image-curve-disabled')).toBe(true);
  });

  it('should mark items with the correct image alignment class for the all-left-aligned option', async () => {
    getByTestId(containerBlock, 'imageAlignment').innerHTML =
      '<div>all-left-aligned</div>';
    containerBlock.appendChild(itemTemplate.cloneNode(true));
    containerBlock.appendChild(itemTemplate.cloneNode(true));
    containerBlock.appendChild(itemTemplate.cloneNode(true));
    await decorate(containerBlock);
    const items = containerBlock.querySelectorAll('.image-and-text');
    items.forEach((item) => {
      expect(item.classList.contains('image-left')).toBe(true);
    });
  });

  it('should mark items with the correct image alignment class for the all-right-aligned option', async () => {
    getByTestId(containerBlock, 'imageAlignment').innerHTML =
      '<div>all-right-aligned</div>';
    containerBlock.appendChild(itemTemplate.cloneNode(true));
    containerBlock.appendChild(itemTemplate.cloneNode(true));
    containerBlock.appendChild(itemTemplate.cloneNode(true));
    await decorate(containerBlock);
    const items = containerBlock.querySelectorAll('.image-and-text');
    items.forEach((item) => {
      expect(item.classList.contains('image-right')).toBe(true);
    });
  });

  it('should mark items with the correct image alignment class for the alternate-left-aligned option', async () => {
    getByTestId(containerBlock, 'imageAlignment').innerHTML =
      '<div>alternate-left-aligned</div>';
    containerBlock.appendChild(itemTemplate.cloneNode(true));
    containerBlock.appendChild(itemTemplate.cloneNode(true));
    containerBlock.appendChild(itemTemplate.cloneNode(true));
    await decorate(containerBlock);
    const items = containerBlock.querySelectorAll('.image-and-text');
    expect(items[0].classList.contains('image-left')).toBe(true);
    expect(items[1].classList.contains('image-right')).toBe(true);
    expect(items[2].classList.contains('image-left')).toBe(true);
  });

  it('should mark items with the correct image alignment class for the alternate-right-aligned option', async () => {
    getByTestId(containerBlock, 'imageAlignment').innerHTML =
      '<div>alternate-right-aligned</div>';
    containerBlock.appendChild(itemTemplate.cloneNode(true));
    containerBlock.appendChild(itemTemplate.cloneNode(true));
    containerBlock.appendChild(itemTemplate.cloneNode(true));
    await decorate(containerBlock);
    const items = containerBlock.querySelectorAll('.image-and-text');
    expect(items[0].classList.contains('image-right')).toBe(true);
    expect(items[1].classList.contains('image-left')).toBe(true);
    expect(items[2].classList.contains('image-right')).toBe(true);
  });

  it('should mark the first item as .highlighted if Highlights first article is true', async () => {
    getByTestId(containerBlock, 'firstArticleHighlighted').innerHTML =
      '<div>first-article-highlighted</div>';

    containerBlock.appendChild(itemTemplate.cloneNode(true));
    containerBlock.appendChild(itemTemplate.cloneNode(true));
    await decorate(containerBlock);
    const items = containerBlock.querySelectorAll('.image-and-text');
    expect(items[0].classList.contains('highlighted')).toBe(true);
    expect(items[1].classList.contains('highlighted')).toBe(false);
  });

  it('should mark the last item with .last-item', async () => {
    containerBlock.appendChild(itemTemplate.cloneNode(true));
    containerBlock.appendChild(itemTemplate.cloneNode(true));
    await decorate(containerBlock);
    const items = containerBlock.querySelectorAll('.image-and-text');
    expect(items[0].classList.contains('last-item')).toBe(false);
    expect(items[1].classList.contains('last-item')).toBe(true);
  });

  it('should handle links properly', async () => {
    containerBlock.appendChild(itemTemplate.cloneNode(true));
    await decorate(containerBlock);
    const items = containerBlock.querySelectorAll('.image-and-text');
    const links = items[0].querySelectorAll('.standalone');
    expect(links).toBeDefined();
    expect(links.length).toBe(3);
    expect(links[0].href).toBe('https://qantas.com/link1');
    expect(links[1].href).toBe('https://qantas.com/link2');
    expect(links[2].href).toBe('https://qantas.com/link3');
  });
});
