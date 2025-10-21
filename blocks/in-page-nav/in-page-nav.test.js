import { describe, it, expect, vi, beforeEach } from 'vitest';
import decorate from './in-page-nav.js';

vi.mock('../../scripts/scripts.js', () => ({
  fetchLanguagePlaceholders: vi.fn(),
  moveInstrumentation: vi.fn(),
}));

vi.mock('../../scripts/utils/dom.js', () => ({
  createElementWithClasses: (tag, ...classes) => {
    const el = document.createElement(tag);
    el.className = classes.join(' ');
    return el;
  },
}));

vi.mock('./build-inpage-navlinks.js', () => ({
  default: vi.fn(),
}));

const { fetchLanguagePlaceholders } = await import('../../scripts/scripts.js');
const buildNavList = (await import('./build-inpage-navlinks.js')).default;

describe('decorate', () => {
  let block;

  beforeEach(() => {
    document.body.innerHTML = '';
    block = document.createElement('div');
    document.body.appendChild(block);

    fetchLanguagePlaceholders.mockReset();
    buildNavList.mockReset();
  });

  it('should do nothing if placeholders are missing or empty', async () => {
    fetchLanguagePlaceholders.mockResolvedValue(undefined);

    await decorate(block);

    expect(document.querySelector('nav.in-page-nav')).toBeNull();
    expect(buildNavList).not.toHaveBeenCalled();
  });

  it('should create nav with all expected elements and call buildNavList', async () => {
    fetchLanguagePlaceholders.mockResolvedValue({
      inPageNavHeading: 'In-Page Navigation',
      globalShowMore: 'Show more',
      globalShowLess: 'Show less',
    });

    await decorate(block);

    const nav = document.querySelector('nav.in-page-nav');
    expect(nav).not.toBeNull();

    const heading = nav.querySelector('h2.nav-heading');
    expect(heading).not.toBeNull();
    expect(heading.textContent).toBe('In-Page Navigation');

    const navList = nav.querySelector('ul.nav-list');
    expect(navList).not.toBeNull();

    const toggleButton = nav.querySelector('button.show-more-button');
    expect(toggleButton).not.toBeNull();
    expect(toggleButton.dataset.showMore).toBe('Show more');
    expect(toggleButton.dataset.showLess).toBe('Show less');

    const label = toggleButton.querySelector('.label');
    expect(label.textContent).toBe('Show more');

    const chevron = toggleButton.querySelector('.chevron');
    expect(chevron).not.toBeNull();
    expect(chevron.classList.contains('chevron-down')).toBe(true);

    expect(buildNavList).toHaveBeenCalled();
  });
});
