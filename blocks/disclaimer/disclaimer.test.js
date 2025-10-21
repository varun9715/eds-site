import { describe, it, expect, vi, beforeEach } from 'vitest';
import decorate from './disclaimer.js';
import * as domUtils from '../../scripts/utils/dom.js';
import * as commonUtils from '../../scripts/utils/common-utils.js';

// Mock disclaimer-item module
vi.mock('./disclaimer-item.js', () => ({
  default: vi.fn(async (el, i) => {
    const div = document.createElement('div');
    div.className = 'disclaimer-item-content';
    div.id = `disclaimer-mock-${i}`;
    const p = document.createElement('p');
    p.textContent = `Mock Disclaimer ${i}`;
    div.appendChild(p);
    return div;
  }),
}));

describe('decorate()', () => {
  let block;
  let itemTemplate;

  beforeEach(() => {
    document.body.innerHTML = '';
    block = document.createElement('div');
    block.classList.add('disclaimer', 'block');

    // Create title structure with a heading
    const titleDiv = document.createElement('div');
    const titleInner = document.createElement('div');
    const heading = document.createElement('h2');
    heading.textContent = 'Important Information - Authored Title';
    titleInner.appendChild(heading);
    titleDiv.appendChild(titleInner);
    block.appendChild(titleDiv);

    // Define reusable item template
    itemTemplate = document.createElement('div');
    itemTemplate.textContent = 'Mock item content';

    // Mocks
    vi.spyOn(domUtils, 'promoteFirstChildIfExists').mockImplementation(
      (el) => el.firstElementChild,
    );
    vi.spyOn(domUtils, 'createElementWithClasses').mockImplementation(
      (tag, ...classes) => {
        const el = document.createElement(tag);
        el.classList.add(...classes);
        return el;
      },
    );
  });

  it('should match snapshot for author mode with 2 items', async () => {
    vi.spyOn(commonUtils, 'isAuthorMode').mockReturnValue(true);

    // Add 2 cloned items to the block
    block.appendChild(itemTemplate.cloneNode(true));
    block.appendChild(itemTemplate.cloneNode(true));

    await decorate(block);

    expect(block.innerHTML).toMatchSnapshot();
  });

  it('should apply disclaimer-hide class in non-author mode', async () => {
    vi.spyOn(commonUtils, 'isAuthorMode').mockReturnValue(false);

    block.appendChild(itemTemplate.cloneNode(true));
    block.appendChild(itemTemplate.cloneNode(true));

    await decorate(block);

    expect(block.classList.contains('disclaimer-hide')).toBe(true);
  });
});
