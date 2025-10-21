import { describe, it, expect, beforeEach } from 'vitest';
import { createMockElement, getByTestId } from '../../scripts/vitest/vitest-utils.js';
import decorate from './logo-and-text-container.js';

describe('logo-and-text-container block', () => {
  let section;
  let containerBlock;
  let itemTemplate;

  beforeEach(() => {
    document.body.innerHTML = '';
    section = document.createElement('div');
    containerBlock = document.createElement('div');
    containerBlock.classList.add('logo-and-text-container');
    section.appendChild(containerBlock);

    // Prepare logo item template
    itemTemplate = document.createElement('div');
    const itemChildren = [
      createMockElement('div', '<img src="https://example.com/icon.png"/>', 'icon'),
      createMockElement('div', 'Image Alt Text', 'altText'),
      createMockElement('div', '', 'hideAltText'),
      createMockElement(
        'div',
        `
          <h2>Enter your title here</h2>
          <div><p>Enter your body text here</p></div>
          <p><a href="https://qantas.com/au/en.html">Link</a></p>
          <p><a href="https://qantas.com/au/about-us.html">Link</a></p>
        `,
        'content',
      ),
    ];
    itemChildren.forEach((child) => itemTemplate.appendChild(child));
  });

  const layoutCases = [
    'layout-1-col',
    'layout-2-col',
    'layout-3-col',
    'layout-4-col',
    'layout-4-col-center',
  ];

  layoutCases.forEach((layout) => {
    it(`should retain class "${layout}" after decoration`, async () => {
      containerBlock.innerHTML = '';
      containerBlock.className = '';
      containerBlock.classList.add(layout);

      containerBlock.appendChild(itemTemplate.cloneNode(true));
      await decorate(containerBlock);

      const classList = Array.from(containerBlock.classList);
      expect(classList).toContain(layout);
      expect(containerBlock.classList).toContain('logo-and-text');
    });
  });

  it('should match the rendered snapshot', async () => {
    containerBlock.classList.add('layout-1-col');
    containerBlock.appendChild(itemTemplate.cloneNode(true));
    await decorate(containerBlock);
    expect(section.innerHTML).toMatchSnapshot();
  });

  it('should add correct heading class and tag', async () => {
    const item = itemTemplate.cloneNode(true);
    getByTestId(item, 'content').innerHTML = '<h2>Test Title</h2>';
    containerBlock.classList.add('layout-2-col');
    containerBlock.appendChild(item);
    await decorate(containerBlock);

    const heading = containerBlock.querySelector('.logo-and-text-title');
    expect(heading).toBeTruthy();
    expect(heading.tagName).toBe('H2');
    // Update the expected class to match the actual class used in your component
    expect(heading.classList.contains('display-03')).toBe(true);
  });

  it('should not render heading if no heading present', async () => {
    const item = itemTemplate.cloneNode(true);
    getByTestId(item, 'content').innerHTML = '<div><p>Body only</p></div>';
    containerBlock.appendChild(item);
    await decorate(containerBlock);

    const heading = containerBlock.querySelector('.logo-and-text-title');
    expect(heading).toBeFalsy();
  });

  it('should add alt text to image unless hideAltText is true', async () => {
    const item = itemTemplate.cloneNode(true);
    getByTestId(item, 'hideAltText').textContent = '';
    getByTestId(item, 'altText').textContent = 'My Alt';
    containerBlock.appendChild(item);
    await decorate(containerBlock);

    const img = containerBlock.querySelector('.logo-and-text-image img');
    expect(img.alt).toBe('My Alt');
  });

  it('should empty alt attribute if hideAltText is true', async () => {
    const item = itemTemplate.cloneNode(true);
    getByTestId(item, 'hideAltText').textContent = 'true';
    containerBlock.appendChild(item);
    await decorate(containerBlock);

    const img = containerBlock.querySelector('.logo-and-text-image img');
    expect(img.alt).toBe('');
  });

  it('should add standalone link for P > A', async () => {
    const item = itemTemplate.cloneNode(true);
    getByTestId(item, 'content').innerHTML = '<p><a href="#">Standalone</a></p>';
    containerBlock.appendChild(item);
    await decorate(containerBlock);

    const link = containerBlock.querySelector('.logo-and-text-link.standalone');
    expect(link).toBeTruthy();
    expect(link.tagName).toBe('A');
    expect(link.textContent).toBe('Standalone');
  });

  it('should add body text content', async () => {
    const item = itemTemplate.cloneNode(true);
    getByTestId(item, 'content').innerHTML = '<div><p>Body text here</p></div>';
    containerBlock.appendChild(item);
    await decorate(containerBlock);

    const body = containerBlock.querySelector('.logo-and-text-body');
    expect(body).toBeTruthy();
    expect(body.textContent).toContain('Body text here');
  });
});
