import { describe, it, expect, beforeEach } from 'vitest';
import { createMockElement } from '../../scripts/vitest/vitest-utils.js';
import decorate from './offset-section-content.js';

describe('Offset section content block', () => {
  let section;
  let containerBlock;

  beforeEach(() => {
    // Set up mock DOM block
    document.body.innerHTML = '';

    const heading = createMockElement(
      'div',
      `<div>
              <p>heading</p>
            </div>
            <div>
              <h2 id="heading">Heading</h2>
            </div>
          `,
      'heading',
    );

    const text = createMockElement(
      'div',
      `<div>
              <p>text</p>
            </div>
            <div>
              <p>Enter your body text here</p>
            <ul>
              <li>Enter your bullet points here</li>
              <li>Enter your bullet points here</li>
              <li>Enter your bullet points here</li>
            </ul>
          </div>`,
      'text',
    );

    const cta1 = createMockElement(
      'div',
      `<div><p>cta1</p></div>
            <div><p><a href="/content/eds-site/some-cool-link">CTA1</a></p></div>`,
      'cta1',
    );
    const cta2 = createMockElement(
      'div',
      `<div><p>cta2</p></div>
            <div><p><a href="https://qantas.com/au/en.html">CTA2</a></p></div>`,
      'cta2',
    );
    section = document.createElement('div');
    section.innerHTML = `
      <div class="section offset-section-content-container" data-type="offset-section">
        <div class="offset-section-content-wrapper">
          <div class="offset-section-content">
            ${heading.outerHTML.trim()}
            ${text.outerHTML.trim()}
            ${cta1.outerHTML.trim()}
            ${cta2.outerHTML.trim()}
        
          </div>
        </div>
        <div class="default-content-wrapper">
          <h4 id="right-side-5">Right side 5</h4>
          <p>text</p>
        </div>
      </div>`;

    containerBlock = section.querySelector('.offset-section-content');
  });

  it('should match the rendered snapshot', async () => {
    await decorate(containerBlock);
    expect(containerBlock.innerHTML).toMatchSnapshot();
  });

  it('should contain a heading', async () => {
    await decorate(containerBlock);
    const headingEl = containerBlock.querySelector('#heading');
    expect(headingEl.tagName).toBe('H2');
    expect(headingEl.textContent).toBe('Heading');
  });

  it('should contain text', async () => {
    await decorate(containerBlock);
    const textEl = containerBlock.querySelector('.offset-content-text p');
    expect(textEl.textContent).toBe('Enter your body text here');
  });

  it('should handle links properly', async () => {
    await decorate(containerBlock);
    const links = containerBlock.querySelectorAll('.standalone');
    expect(links).toBeDefined();
    expect(links.length).toBe(2);
    expect(links[0].href.indexOf('/content/eds-site/') > 0).toBeTruthy();
    expect(links[1].href).toBe('https://qantas.com/au/en.html');
  });
});
