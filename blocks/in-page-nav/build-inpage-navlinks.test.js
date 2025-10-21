import { describe, it, expect, beforeEach, vi } from 'vitest';
import buildNavList from './build-inpage-navlinks.js';

function createMockSection({ id, navId, label, exclude = false, headingText } = {}) {
  const section = document.createElement('div');
  section.classList.add('section');
  if (id) section.id = id;
  if (navId) section.setAttribute('data-anchor-section-url', navId);
  if (label !== undefined) section.setAttribute('data-anchor-link-text', label);
  if (exclude) section.setAttribute('data-exclude-from-anchor-link', 'true');

  if (headingText) {
    const wrapper = document.createElement('div');
    wrapper.className = 'default-content-wrapper';
    const heading = document.createElement('h2');
    heading.textContent = headingText;
    wrapper.appendChild(heading);
    section.appendChild(wrapper);
  }

  return section;
}

describe('buildNavList', () => {
  let nav;
  let list;
  let toggleButton;

  beforeEach(() => {
    document.body.innerHTML = '';

    nav = document.createElement('nav');
    nav.classList.add('in-page-nav');

    list = document.createElement('ul');
    list.classList.add('nav-list');

    toggleButton = document.createElement('button');
    toggleButton.classList.add('show-more-button');
    toggleButton.dataset.showMore = 'Show more';
    toggleButton.dataset.showLess = 'Show less';

    const labelSpan = document.createElement('span');
    labelSpan.className = 'label';
    labelSpan.textContent = 'Show more';

    const chevron = document.createElement('span');
    chevron.className = 'chevron';

    toggleButton.appendChild(labelSpan);

    toggleButton.appendChild(chevron);

    nav.appendChild(list);
    nav.appendChild(toggleButton);
    document.body.appendChild(nav);

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(max-width: 35.4375rem)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('adds a nav item from section with label', () => {
    const section = createMockSection({ id: 'sec1', navId: 'sec1', label: 'Label 1' });
    document.body.appendChild(section);

    buildNavList();

    const items = nav.querySelectorAll('.nav-list li');
    expect(items.length).toBe(1);
    const link = items[0].querySelector('a.nav-link');
    expect(link).not.toBeNull();
    expect(link.textContent).toBe('Label 1');
    expect(link.href).toContain('#sec1');
  });

  it('uses heading text as fallback label', () => {
    const section = createMockSection({
      id: 'sec2',
      navId: 'sec2',
      label: '',
      headingText: 'Fallback',
    });
    document.body.appendChild(section);

    buildNavList();

    const link = nav.querySelector('.nav-list li a.nav-link');
    expect(link).not.toBeNull();
    expect(link.textContent).toBe('Fallback');
  });

  it('skips excluded sections', () => {
    const section = createMockSection({
      id: 'sec3',
      navId: 'sec3',
      label: 'Exclude me',
      exclude: true,
    });
    document.body.appendChild(section);

    buildNavList();

    const items = nav.querySelectorAll('.nav-list li');
    expect(items.length).toBe(0);
  });

  it('adds toggle button only when more than 5 items on mobile', () => {
    for (let i = 0; i < 6; i += 1) {
      const section = createMockSection({
        id: `sec${i}`,
        navId: `sec${i}`,
        label: `Item ${i}`,
      });
      document.body.appendChild(section);
    }

    buildNavList();

    expect(toggleButton.style.display).toBe('inline-flex');
  });

  it('does not show toggle when items are 5 or fewer on mobile', () => {
    for (let i = 0; i < 5; i += 1) {
      const section = createMockSection({
        id: `sec${i}`,
        navId: `sec${i}`,
        label: `Item ${i}`,
      });
      document.body.appendChild(section);
    }

    buildNavList();

    expect(toggleButton.style.display).toBe('none');
  });

  it('toggles expanded class and updates label text', () => {
    for (let i = 0; i < 6; i += 1) {
      const section = createMockSection({
        id: `s${i}`,
        navId: `s${i}`,
        label: `Link ${i}`,
      });
      document.body.appendChild(section);
    }

    buildNavList();

    const label = toggleButton.querySelector('.label');
    expect(label.textContent).toBe('Show more');

    toggleButton.click();
    expect(nav.classList.contains('expanded')).toBe(true);
    expect(label.textContent).toBe('Show less');

    toggleButton.click();
    expect(nav.classList.contains('expanded')).toBe(false);
    expect(label.textContent).toBe('Show more');
  });
});
