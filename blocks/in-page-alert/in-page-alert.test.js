import { describe, it, expect, beforeEach } from 'vitest';
import decorate from './in-page-alert.js';

function createMockBlock({
  alertType = 'information',
  alertText = 'Test alert text',
  captionText = 'Test caption',
} = {}) {
  const block = document.createElement('div');

  const typeDiv = document.createElement('div');
  typeDiv.textContent = alertType;

  const textDiv = document.createElement('div');
  textDiv.innerHTML = alertText;

  const captionDiv = document.createElement('div');
  captionDiv.textContent = captionText;

  block.appendChild(typeDiv);
  block.appendChild(textDiv);
  block.appendChild(captionDiv);

  return block;
}

describe('in-page-alert decorate()', () => {
  let block;

  beforeEach(() => {
    block = createMockBlock();
  });

  it('renders information alert with correct classes and content', () => {
    decorate(block);

    const alert = block.querySelector('.in-page-alert--information');
    expect(alert).not.toBeNull();
    expect(alert.getAttribute('role')).toBe('status');

    const content = block.querySelector('.in-page-alert--content');
    expect(content).not.toBeNull();
    expect(content.innerHTML).toContain('Test alert text');

    const caption = block.querySelector('.caption');
    expect(caption).not.toBeNull();
    expect(caption.textContent).toBe('Test caption');
  });

  it('renders alert type with correct class and role', () => {
    block = createMockBlock({
      alertType: 'alert',
      alertText:
        'This is not a test, this is your Emergency Broadcast System. Announcing the commencement of the annual purge sanctioned by the U.S. Government.',
      captionText: 'Purge ends at 7:00am the following day.',
    });
    decorate(block);

    const alert = block.querySelector('.in-page-alert--alert');
    expect(alert).not.toBeNull();
    expect(alert.getAttribute('role')).toBe('status');
    expect(block.querySelector('.in-page-alert--content').innerHTML).toContain(
      'This is not a test, this is your Emergency Broadcast System. Announcing the commencement of the annual purge sanctioned by the U.S. Government.',
    );
    expect(block.querySelector('.caption').textContent).toBe(
      'Purge ends at 7:00am the following day.',
    );
  });

  it('renders without caption if captionText is empty', () => {
    block = createMockBlock({
      alertType: 'information',
      alertText:
        'This is not a test, this is your Emergency Broadcast System. Announcing the commencement of the annual purge sanctioned by the U.S. Government.',
      captionText: '',
    });
    decorate(block);

    expect(block.querySelector('.caption')).toBeNull();
    expect(block.querySelector('.in-page-alert--content').innerHTML).toContain(
      'This is not a test, this is your Emergency Broadcast System. Announcing the commencement of the annual purge sanctioned by the U.S. Government.',
    );
  });
});
