import { describe, it, expect, beforeEach, vi } from 'vitest';
import buildAnchorSection from './build-anchor-section.js';
import { fetchLanguagePlaceholders } from '../scripts.js';

vi.mock('../scripts.js', () => ({
  fetchLanguagePlaceholders: vi.fn(),
}));

describe('buildAnchorSection', () => {
  let main;
  let section;

  beforeEach(() => {
    document.body.innerHTML = '';

    // Create <main id="main-content"> and append to body
    main = document.createElement('main');
    main.id = 'main-content';
    document.body.appendChild(main);

    // Create a section inside <main>
    section = document.createElement('div');
    section.className = 'section';
    main.appendChild(section);

    fetchLanguagePlaceholders.mockResolvedValue({ globalBackToTop: 'Back to top' });
  });

  it('does not set id if data-anchor-section-url is missing', async () => {
    await buildAnchorSection(main);
    expect(section.id).toBe('');
  });

  it('adds back-to-top link when data-show-back-to-link is "true"', async () => {
    section.setAttribute('data-anchor-section-url', 'my-id');
    section.setAttribute('data-show-back-to-link', 'true');

    await buildAnchorSection(main);

    const link = section.querySelector('.back-to-top-link');
    expect(link).not.toBeNull();
    expect(link.href).toContain('#main-content');
    expect(link.textContent).toMatch(/Back to top/i);
  });

  it('does not add link when data-show-back-to-link is "false"', async () => {
    section.setAttribute('data-anchor-section-url', 'my-id');
    section.setAttribute('data-show-back-to-link', 'false');

    await buildAnchorSection(main);

    const link = section.querySelector('.back-to-top-link');
    expect(link).toBeNull();
  });

  it('adds link inside .default-content-wrapper if present', async () => {
    section.setAttribute('data-anchor-section-url', 'my-id');
    section.setAttribute('data-show-back-to-link', 'true');

    const wrapper = document.createElement('div');
    wrapper.className = 'default-content-wrapper';
    section.appendChild(wrapper);

    await buildAnchorSection(main);

    const link = section.querySelector('.anchor-wrapper .back-to-top-link');
    expect(link).not.toBeNull();
  });

  it('does not duplicate link if one already exists', async () => {
    section.setAttribute('data-anchor-section-url', 'my-id');
    section.setAttribute('data-show-back-to-link', 'true');

    await buildAnchorSection(main);
    await buildAnchorSection(main);

    const links = section.querySelectorAll('.back-to-top-link');
    expect(links.length).toBe(1);
  });

  it('does nothing if placeholder is empty', async () => {
    fetchLanguagePlaceholders.mockResolvedValueOnce({});
    section.setAttribute('data-anchor-section-url', 'my-id');
    section.setAttribute('data-show-back-to-link', 'true');

    await buildAnchorSection(main);
    const link = section.querySelector('.back-to-top-link');
    expect(link).toBeNull();
  });
});
