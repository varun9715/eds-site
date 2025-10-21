import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockElement } from '../../scripts/vitest/vitest-utils.js';
import decorate from './hero.js';

import * as domUtils from '../../scripts/utils/dom.js';
import * as commonUtils from '../../scripts/utils/common-utils.js';
import * as damApis from '../../scripts/utils/dam-open-apis.js';

// DOM Mocking Helpers
describe('decorate()', () => {
  let block;

  beforeEach(() => {
    // Set up mock DOM block
    document.body.innerHTML = '';
    block = document.createElement('div');

    // Create 7 children as expected
    const children = [
      createMockElement('div', 'hero-img'), // heroImageEl
      createMockElement('div', 'check-alt'), // checkImgAltEl
      createMockElement('div', 'caption'), // imgCaptionEl
      createMockElement('div', '<h1>Hero Title</h1>'), // heroTitleEl
      createMockElement('div', 'intro'), // introTextEl
      createMockElement('div', 'logo-img'), // logoImageEl
      createMockElement('div', 'logo-alt'), // checkLogoAltEl
    ];

    children.forEach((child) => block.appendChild(child));
  });

  it('should decorate block with hero and logo images if renderable', async () => {
    // Mocks
    vi.spyOn(commonUtils, 'getUrlAndSetAltFromElement').mockReturnValue('mock-dam-url');

    const mockHeroImage = document.createElement('picture');
    const mockLogoImage = document.createElement('div');

    vi.spyOn(damApis, 'createPicTagWithOpenApi').mockResolvedValue(mockHeroImage);
    vi.spyOn(damApis, 'createPicAndImgWithOpenApi').mockResolvedValue(mockLogoImage);

    vi.spyOn(domUtils, 'promoteFirstChildIfExists').mockImplementation((el) => el);
    vi.spyOn(domUtils, 'createElementWithClasses').mockImplementation(
      (tag, className) => {
        const el = document.createElement(tag);
        el.classList.add(className);
        return el;
      },
    );
    vi.spyOn(domUtils, 'isRenderableElement').mockReturnValue(true);

    const setImgAltSpy = vi
      .spyOn(commonUtils, 'setImgAltIfRequired')
      .mockImplementation(() => {});

    // Act
    await decorate(block);

    // Assert
    expect(block.querySelector('picture')).toBeTruthy();
    expect(block.querySelector('.logo')).toBeTruthy();
    expect(block.querySelector('.hero-content')).toBeTruthy();
    expect(setImgAltSpy).toHaveBeenCalledTimes(2);
    expect(block.classList.contains('no-hero-image')).toBe(false);
  });

  it('should apply no-hero-image class when hero image is not renderable', async () => {
    vi.spyOn(commonUtils, 'getUrlAndSetAltFromElement').mockReturnValue('mock-dam-url');
    vi.spyOn(damApis, 'createPicTagWithOpenApi').mockResolvedValue(null);
    vi.spyOn(damApis, 'createPicAndImgWithOpenApi').mockResolvedValue(null);
    vi.spyOn(domUtils, 'promoteFirstChildIfExists').mockImplementation((el) => el);
    vi.spyOn(domUtils, 'createElementWithClasses').mockImplementation(
      (tag, className) => {
        const el = document.createElement(tag);
        el.classList.add(className);
        return el;
      },
    );
    vi.spyOn(domUtils, 'isRenderableElement').mockReturnValue(false);

    await decorate(block);
    expect(block.classList.contains('no-hero-image')).toBe(true);
  });
});
