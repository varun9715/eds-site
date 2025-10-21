import { describe, it, expect, beforeEach, vi } from 'vitest';
import decorateItem from './disclaimer-item.js';

// Mock dependencies
vi.mock('../../scripts/utils/dom.js', () => ({
  getTextContent: (el) => el?.textContent || '',
  createElementWithClasses: (tag, ...classes) => {
    const el = document.createElement(tag);
    el.className = classes.join(' ');
    return el;
  },
}));
vi.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: vi.fn(),
}));

describe('decorateItem', () => {
  let block;
  let typeDiv;
  let idDiv;
  let descDiv;
  let descP;

  beforeEach(() => {
    document.body.innerHTML = '';
    block = document.createElement('div');

    typeDiv = document.createElement('div');
    idDiv = document.createElement('div');
    descDiv = document.createElement('div');
    descP = document.createElement('p');
    descP.textContent =
      'Generic Disclaimer 2 ---- It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it h';
    descDiv.appendChild(descP);

    block.appendChild(typeDiv);
    block.appendChild(idDiv);
    block.appendChild(descDiv);
  });

  it('creates a generic disclaimer item with correct id and type', async () => {
    typeDiv.textContent = 'generic';
    idDiv.textContent = '';
    const result = await decorateItem(block, 2);

    expect(result.classList.contains('disclaimer-item-content')).toBe(true);
    expect(result.getAttribute('data-disclaimer-type')).toBe('generic');
    expect(result.id).toBe('d-generic-3');
    expect(result.querySelector('p').textContent).toContain('Generic Disclaimer 2');
  });

  it('creates a manual disclaimer item with correct id and type', async () => {
    typeDiv.textContent = 'manual';
    idDiv.textContent = 'd-manual-1';
    descP.textContent =
      'Manual Disclaimer 1 ---- It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it h';
    const result = await decorateItem(block, 1);

    expect(result.classList.contains('disclaimer-item-content')).toBe(true);
    expect(result.getAttribute('data-disclaimer-type')).toBe('manual');
    expect(result.id).toBe('d-manual-1');
    expect(result.querySelector('p').textContent).toContain('Manual Disclaimer 1');
  });

  it('creates a global disclaimer item with correct id and type', async () => {
    typeDiv.textContent = 'global';
    idDiv.textContent = 'disclaimer-global-1';
    descP.textContent = 'Global Disclaimer 1';
    const result = await decorateItem(block, 0);

    expect(result.classList.contains('disclaimer-item-content')).toBe(true);
    expect(result.getAttribute('data-disclaimer-type')).toBe('global');
    expect(result.id).toBe('disclaimer-global-1');
    expect(result.querySelector('p').textContent).toContain('Global Disclaimer 1');
  });

  it('handles missing description node gracefully', async () => {
    block.removeChild(descDiv);
    const result = await decorateItem(block, 3);

    expect(result.classList.contains('disclaimer-item-content')).toBe(true);
    expect(result.querySelector('p')).toBeNull();
  });

  it('does not overwrite data-disclaimer-type if already present', async () => {
    typeDiv.textContent = 'manual';
    idDiv.textContent = 'd-manual-2';
    const result = await decorateItem(block, 4);
    result.setAttribute('data-disclaimer-type', 'custom');
    // Call again to check it doesn't overwrite
    await decorateItem(block, 4);
    expect(result.getAttribute('data-disclaimer-type')).toBe('custom');
  });
});
