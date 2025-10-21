import {
  describe, it, expect, beforeEach, vi,
} from 'vitest';
import decorate from './cards.js';
import { moveInstrumentation } from '../../scripts/scripts.js'; // Import moveInstrumentation

// Mock the createOptimizedPicture function
vi.mock('../../scripts/aem.js', () => ({
  createOptimizedPicture: vi.fn((src, alt) => {
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    picture.appendChild(img);
    return picture;
  }),
}));

// Mock the moveInstrumentation function
vi.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: vi.fn(() => {}),
}));

describe('decorate function', () => {
  let block;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Create a mock block element with children
    block = document.createElement('div');
    block.innerHTML = `
      <div>
        <div>
          <picture>
            <img src="https://via.placeholder.com/150" alt="Sample Image 1">
          </picture>
        </div>
        <div>
          <p><strong>Unmatched speed</strong></p>
          <p>AEM is the fastest way to publish, create, and serve websites</p>
        </div>
      </div>
      <div>
        <div>
          <picture>
            <img src="https://via.placeholder.com/150" alt="Sample Image 2">
          </picture>
        </div>
        <div>
          <p><strong>Seamless Integration</strong></p>
          <p>Easily integrate with other Adobe products</p>
        </div>
      </div>
    `;
  });

  it('should transform the block into a list of cards', () => {
    decorate(block);

    // Check if the block is transformed into a ul element
    const ul = block.querySelector('ul');
    expect(ul).not.toBeNull();

    // Check if the ul element contains li elements
    const liElements = ul.querySelectorAll('li');
    expect(liElements.length).toBe(2);
  });

  it('should call moveInstrumentation for each row and image', () => {
    decorate(block);

    // Check if moveInstrumentation is called for each row and image
    expect(vi.mocked(moveInstrumentation).mock.calls.length).toBe(4);
  });

  it('should replace images with optimized pictures', () => {
    decorate(block);

    // Check if images are replaced with optimized pictures
    const optimizedPics = block.querySelectorAll('picture');

    expect(optimizedPics.length).toBe(2);
    optimizedPics.forEach((pic) => {
      const img = pic.querySelector('img');
      expect(img).not.toBeNull();
      expect(img.src).toMatch(/https:\/\/via.placeholder.com\/150/);
    });
  });

  it('should set the correct class names for card elements', () => {
    decorate(block);

    // Check if the correct class names are set for card elements
    const ul = block.querySelector('ul');
    const liElements = ul.querySelectorAll('li');
    liElements.forEach((li) => {
      const divs = li.querySelectorAll('div');
      divs.forEach((div) => {
        if (div.children.length === 1 && div.querySelector('picture')) {
          expect(div.className).toBe('cards-card-image');
        } else {
          expect(div.className).toBe('cards-card-body');
        }
      });
    });
  });
});
