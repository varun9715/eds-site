import { describe, it, expect, beforeEach, vi } from 'vitest';
import decorate from './app-download.js';

describe('App Download Block', () => {
  let mockBlock;

  beforeEach(() => {
    vi.clearAllMocks();

    mockBlock = document.createElement('div');
    mockBlock.innerHTML = `
      <div>
        <div>
          <p>
            <img src="https://delivery-p146463-e1510253.adobeaemcloud.com/adobe/assets/urn:aaid:aem:aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/renditions/original/as/image1.svg?assetname=image1.svg" alt="Image 1 Alt Text">
          </p>
          <p><a href="https://www.link1.com">https://www.link1.com</a></p>
        </div>
      </div>
      <div>
        <div>
          <p>
            <img src="https://delivery-p146463-e1510253.adobeaemcloud.com/adobe/assets/urn:aaid:aem:bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/renditions/original/as/image2.svg?assetname=image2.svg" alt="Image 2 Alt Text">
          </p>
          <p><a href="https://www.link2.com">https://www.link2.com</a></p>
        </div>
      </div>
    `;
  });

  describe('decorate', () => {
    it('should move images to be within anchor tags', async () => {
      await decorate(mockBlock);

      // Check that images are now inside anchor tags
      const images = mockBlock.querySelectorAll('img');
      expect(images.length).toBe(2);

      images.forEach((img) => {
        const parentAnchor = img.closest('a');
        expect(parentAnchor).toBeTruthy();
        expect(parentAnchor.tagName).toBe('A');
      });

      // Check that the first image is inside link 1
      const link1Image = mockBlock.querySelector('img[alt="Image 1 Alt Text"]');
      const link1Anchor = link1Image.closest('a');
      expect(link1Anchor.getAttribute('href')).toBe('https://www.link1.com');

      // Check that the second image is inside link 2
      const link2Image = mockBlock.querySelector('img[alt="Image 2 Alt Text"]');
      const link2Anchor = link2Image.closest('a');
      expect(link2Anchor.getAttribute('href')).toBe('https://www.link2.com');
    });

    it('should preserve image attributes when moving to anchor', async () => {
      await decorate(mockBlock);

      const link1Image = mockBlock.querySelector('img[alt="Image 1 Alt Text"]');
      expect(link1Image.getAttribute('src')).toBe(
        'https://delivery-p146463-e1510253.adobeaemcloud.com/adobe/assets/urn:aaid:aem:aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/renditions/original/as/image1.svg?assetname=image1.svg',
      );
      expect(link1Image.getAttribute('alt')).toBe('Image 1 Alt Text');

      const link2Image = mockBlock.querySelector('img[alt="Image 2 Alt Text"]');
      expect(link2Image.getAttribute('src')).toBe(
        'https://delivery-p146463-e1510253.adobeaemcloud.com/adobe/assets/urn:aaid:aem:bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/renditions/original/as/image2.svg?assetname=image2.svg',
      );
      expect(link2Image.getAttribute('alt')).toBe('Image 2 Alt Text');
    });

    it('should preserve anchor href attributes', async () => {
      await decorate(mockBlock);

      const anchors = mockBlock.querySelectorAll('a');
      expect(anchors.length).toBe(2);

      const hrefs = Array.from(anchors).map((anchor) => anchor.getAttribute('href'));
      expect(hrefs).toContain('https://www.link1.com'); // link 1
      expect(hrefs).toContain('https://www.link2.com'); // link 2
    });

    it('should remove textContent from anchor links after decoration', async () => {
      await decorate(mockBlock);

      const anchors = mockBlock.querySelectorAll('a');
      expect(anchors.length).toBe(2);

      anchors.forEach((anchor) => {
        expect(anchor.textContent.trim()).toBe('');
      });
    });

    it('should apply testid to anchor elements', async () => {
      await decorate(mockBlock);

      const anchors = mockBlock.querySelectorAll('a');
      expect(anchors.length).toBe(2);

      anchors.forEach((anchor) => {
        expect(anchor.getAttribute('data-testid')).toBe('appdownload-link');
      });
    });

    it('should apply testid to image elements', async () => {
      await decorate(mockBlock);

      const images = mockBlock.querySelectorAll('img');
      expect(images.length).toBe(2);

      images.forEach((img) => {
        expect(img.getAttribute('data-testid')).toBe('appdownload-image');
      });
    });
  });
});
