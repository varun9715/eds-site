/* eslint-disable no-unused-vars */
import { describe, it, expect, beforeEach, vi } from 'vitest';

import decorate from './accordion.js';

import * as scripts from '../../scripts/scripts.js';

vi.mock('../../scripts/utils/dom.js', () => ({
  createElementWithClasses: (tag, ...classes) => {
    const el = document.createElement(tag);

    el.classList.add(...classes);

    return el;
  },
}));

vi.mock('../../scripts/scripts.js', () => ({
  fetchLanguagePlaceholders: vi.fn(),
}));

vi.mock('./accordionItem.js', () => ({
  default: vi.fn(async (el, isExpand, id, headingType) => {
    const item = document.createElement('div');
    item.classList.add('accordion-item');

    // Add the .accordion-panel element
    const panel = document.createElement('div');
    panel.classList.add('accordion-panel');
    item.appendChild(panel);

    // Add the .accordion-button element
    const button = document.createElement('button');
    button.classList.add('accordion-button');
    item.appendChild(button);

    return item;
  }),
}));

describe('accordion block - decorate()', () => {
  let block;

  beforeEach(() => {
    document.head.innerHTML = '';

    document.body.innerHTML = '';

    block = document.createElement('div');

    const headingType = document.createElement('div');

    headingType.textContent = 'H3';

    const expandFirst = document.createElement('div');

    expandFirst.textContent = 'true';

    const isFaq = document.createElement('div');

    isFaq.textContent = 'true';

    const accordionItem1 = document.createElement('div');

    const title1 = document.createElement('div');

    title1.textContent = 'What is this?';

    const id1 = document.createElement('div');

    id1.textContent = 'faq1';

    const desc1 = document.createElement('div');

    desc1.textContent = 'This is an accordion.';

    accordionItem1.append(title1, id1, desc1);

    const accordionItem2 = document.createElement('div');

    const title2 = document.createElement('div');

    title2.textContent = 'Another question?';

    const id2 = document.createElement('div');

    id2.textContent = 'faq2';

    const desc2 = document.createElement('div');

    desc2.textContent = 'Another answer.';

    accordionItem2.append(title2, id2, desc2);

    block.append(headingType, expandFirst, isFaq, accordionItem1, accordionItem2);

    scripts.fetchLanguagePlaceholders.mockResolvedValue({
      accordionExpandAll: 'Expand all',

      accordionCollapseAll: 'Collapse all',
    });
  });

  it('should decorate accordion block and add items', async () => {
    await decorate(block);

    expect(block.classList.contains('accordion')).toBe(true);

    expect(block.querySelectorAll('.accordion-item').length).toBe(2);

    expect(block.querySelector('.expand-all-button')).not.toBeNull();
  });

  it('should add schema.org FAQ script if isFaq is true', async () => {
    await decorate(block);

    const schemaScript = document.querySelector('#faqpage-schema');

    expect(schemaScript).not.toBeNull();

    const schema = JSON.parse(schemaScript.textContent);

    expect(schema['@type']).toBe('FAQPage');

    expect(schema.mainEntity.length).toBe(2);

    expect(schema.mainEntity[0].name).toBe('What is this?');

    expect(schema.mainEntity[0].acceptedAnswer.text).toBe('This is an accordion.');
  });

  it('should toggle expand all/collapse all on button click', async () => {
    await decorate(block);

    const toggleBtn = block.querySelector('.expand-all-button');

    expect(toggleBtn.textContent).toBe('Expand all');

    toggleBtn.click();

    expect(toggleBtn.textContent).toBe('Collapse all');

    expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');

    const items = block.querySelectorAll('.accordion-item');

    items.forEach((item) => {
      expect(item.classList.contains('active')).toBe(true);

      const contentArea = item.querySelector('.accordion-panel');

      if (contentArea) {
        expect(contentArea.getAttribute('aria-hidden')).toBe('false');
      }
    });
  });

  it('should skip decoration if placeholders are empty', async () => {
    scripts.fetchLanguagePlaceholders.mockResolvedValueOnce({});

    await decorate(block);

    expect(block.querySelectorAll('.accordion-item').length).toBe(0);
  });
});
