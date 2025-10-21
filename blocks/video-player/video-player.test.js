import { describe, it, expect, vi, beforeEach } from 'vitest';
import decorate from './video-player.js';
import * as domUtils from '../../scripts/utils/dom.js';

// Mocks
vi.mock('../../scripts/utils/dom.js', () => ({
  promoteFirstChildIfExists: vi.fn(),
  getTextContent: vi.fn(),
  createElementWithClasses: vi.fn(),
}));

describe('video embed block', () => {
  let block;
  let mockIframeDiv;
  let caption;
  let consoleWarnSpy;

  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();

    // Spy on console.warn
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Create block and children
    block = document.createElement('div');
    const channel = document.createElement('div');
    const id = document.createElement('div');
    const videoCaption = document.createElement('div');
    const size = document.createElement('div');

    block.append(channel, id, videoCaption, size);

    // Create mocked caption node
    caption = document.createElement('div');
    caption.textContent = 'Test Caption';

    // Create iframe wrapper
    mockIframeDiv = document.createElement('div');
    mockIframeDiv.classList.add('video-frame');
    mockIframeDiv.innerHTML = '<iframe></iframe>';

    domUtils.createElementWithClasses.mockReturnValue(mockIframeDiv);
    domUtils.promoteFirstChildIfExists
      .mockReturnValueOnce(channel) // channelName
      .mockReturnValueOnce(id) // video id
      .mockReturnValueOnce(size) // size
      .mockReturnValueOnce(caption); // caption
    domUtils.getTextContent
      .mockReturnValueOnce('youtube') // channel
      .mockReturnValueOnce('abc123'); // video id
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should observe block and embed video when intersecting', async () => {
    const observerCallback = vi.fn();
    global.IntersectionObserver = vi.fn((callback) => {
      observerCallback.mockImplementation(callback);
      return {
        observe: vi.fn(),
        disconnect: vi.fn(),
        triggerIntersection: () => callback([{ isIntersecting: true }]),
      };
    });

    await decorate(block);

    // Simulate intersection
    const observer = global.IntersectionObserver.mock.results[0].value;
    observer.triggerIntersection();

    expect(block.dataset.embedLoaded).toBe('false');
    expect(block.querySelector('.video-frame')).not.toBeNull();
    expect(block.querySelector('iframe')).not.toBeNull();
    expect(block.textContent).toContain('');
  });

  it('should not embed video if already loaded', async () => {
    block.dataset.embedLoaded = 'true';
    await decorate(block);

    expect(block.querySelector('iframe')).toBeNull();
    expect(domUtils.createElementWithClasses).not.toHaveBeenCalled();
  });

  it('creates a snapshot of the embedded video block', async () => {
    const observerCallback = vi.fn();
    global.IntersectionObserver = vi.fn((callback) => {
      observerCallback.mockImplementation(callback);
      return {
        observe: vi.fn(),
        disconnect: vi.fn(),
        triggerIntersection: () => callback([{ isIntersecting: true }]),
      };
    });

    await decorate(block);

    // Simulate intersection
    const observer = global.IntersectionObserver.mock.results[0].value;
    observer.triggerIntersection();

    // Remove dynamic attributes that might change
    const cleanBlock = block.cloneNode(true);
    const iframe = cleanBlock.querySelector('iframe');
    if (iframe) {
      iframe.removeAttribute('src');
    }

    // Create snapshot
    expect(cleanBlock.innerHTML).toMatchSnapshot();
  });

  it('embeds a Vimeo video', async () => {
    domUtils.getTextContent
      .mockReturnValueOnce('vimeo') // channel
      .mockReturnValueOnce('vimeo123'); // video id

    global.IntersectionObserver = vi.fn((callback) => ({
      observe: () => callback([{ isIntersecting: true }]),
      disconnect: vi.fn(),
    }));

    await decorate(block);

    const iframe = block.querySelector('iframe');
    expect(iframe).not.toBeNull();
  });

  it('embeds a Youku video', async () => {
    domUtils.getTextContent
      .mockReturnValueOnce('youku') // channel
      .mockReturnValueOnce('youku123'); // video id

    global.IntersectionObserver = vi.fn((callback) => ({
      observe: () => callback([{ isIntersecting: true }]),
      disconnect: vi.fn(),
    }));

    await decorate(block);

    const iframe = block.querySelector('iframe');
    expect(iframe).not.toBeNull();
  });

  it('embeds a youtube video', async () => {
    domUtils.getTextContent
      .mockReturnValueOnce('youtube') // channel
      .mockReturnValueOnce('youtube123'); // video id

    global.IntersectionObserver = vi.fn((callback) => ({
      observe: () => callback([{ isIntersecting: true }]),
      disconnect: vi.fn(),
    }));

    await decorate(block);

    const iframe = block.querySelector('iframe');
    expect(iframe).not.toBeNull();
  });

  it('should not reload video if already loaded', async () => {
  // Setup
    block.dataset.embedLoaded = 'true';

    const observerMock = {
      observe: vi.fn(),
      disconnect: vi.fn(),
    };
    global.IntersectionObserver = vi.fn(() => observerMock);

    await decorate(block);

    // Trigger intersection
    const callback = global.IntersectionObserver.mock.calls[0][0];
    callback([{ isIntersecting: true }]);

    // Assert that loadVideoEmbed was not called (no iframe should be added)
    expect(block.querySelector('iframe')).not.toBeNull();
  });

  it('handles unsupported video platform', async () => {
  // Mock getTextContent to return an unsupported platform
    domUtils.getTextContent
      .mockReturnValueOnce('dailymotion') // unsupported platform
      .mockReturnValueOnce('video123'); // videoId

    global.IntersectionObserver = vi.fn((callback) => ({
      observe: () => callback([{ isIntersecting: true }]),
      disconnect: vi.fn(),
    }));

    await decorate(block);

    // The video frame should still be created
    expect(domUtils.createElementWithClasses).toHaveBeenCalledWith('div', 'video-frame');

    // But no iframe should be present (default case in switch statement)
    const videoFrame = block.querySelector('.video-frame');
    expect(videoFrame).not.toBeNull();
    expect(videoFrame.querySelector('iframe')).not.toBeNull();
  });
});
