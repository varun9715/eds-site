import { describe, it, expect, beforeEach, vi } from 'vitest';

import decorate from './accordionItem.js';

import { triggerAccordionClickEvent } from '../../scripts/martech/datalayer.js';

// Mock helpers

vi.mock('../../scripts/utils/dom.js', () => ({
  createElementWithClasses: (tag, ...classes) => {
    const el = document.createElement(tag);

    el.classList.add(...classes);

    return el;
  },
}));

vi.mock('../../scripts/utils/common-utils.js', () => ({
  isAuthorMode: vi.fn().mockReturnValue(false),
}));

vi.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: vi.fn(),
}));

vi.mock('../../scripts/martech/datalayer.js', () => ({
  EVENT_NAME: { ACCORDION_CLICK: 'accordionClick' },

  triggerAccordionClickEvent: vi.fn(),
}));

describe('decorate', () => {
  let block;

  beforeEach(() => {
    document.body.innerHTML = '';
    window.location.hash = '';

    block = document.createElement('div');

    const title = document.createElement('div');

    title.textContent = 'Accordion Title';

    const id = document.createElement('div');

    id.textContent = 'accordion-1';

    const desc = document.createElement('div');

    const p = document.createElement('p');

    const a = document.createElement('a');

    a.href = '#';

    a.textContent = 'Link Only';

    p.appendChild(a);

    desc.appendChild(p);

    block.appendChild(title);

    block.appendChild(id);

    block.appendChild(desc);
  });

  it('should return accordion-item element with heading and content', async () => {
    const item = await decorate(block, true, 'panel-1', 'H3');

    expect(item.classList.contains('accordion-item')).toBe(true);

    const button = item.querySelector('button.accordion-button');

    expect(button).not.toBeNull();

    expect(button.textContent).toBe('Accordion Title');

    expect(button.getAttribute('aria-expanded')).toBe('true');

    const panel = item.querySelector('.accordion-panel');

    expect(panel).not.toBeNull();

    expect(panel.getAttribute('aria-hidden')).toBe('false');
  });

  it('should apply active class if isExpand is true', async () => {
    const item = await decorate(block, true, 'panel-2');

    expect(item.classList.contains('active')).toBe(true);
  });

  it('should not apply active class if isExpand is false', async () => {
    const item = await decorate(block, false, 'panel-3');

    expect(item.classList.contains('active')).toBe(false);
  });

  it('should add has-anchor class to p with anchor only', async () => {
    const item = await decorate(block, false, 'panel-4');

    const anchor = item.querySelector('a');

    expect(anchor.classList.contains('standalone')).toBe(true);

    expect(anchor.closest('p').classList.contains('has-anchor')).toBe(true);
  });

  it('should trigger accordion click event on click', async () => {
    const item = await decorate(block, false, 'panel-5');

    const button = item.querySelector('button');

    const container = document.createElement('div');

    container.appendChild(item);

    document.body.appendChild(container);

    button.click();

    expect(triggerAccordionClickEvent).toHaveBeenCalledWith('Accordion Title');
  });

  it('should update window.location.hash when expanded', async () => {
    const item = await decorate(block, false, 'panel-6');

    const button = item.querySelector('button');

    const container = document.createElement('div');

    container.appendChild(item);

    document.body.appendChild(container);

    button.click();

    expect(window.location.hash).toBe('#accordion-1');
  });
});
