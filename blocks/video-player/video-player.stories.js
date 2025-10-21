import decorate from './video-player.js';
import './video-player.css';

export default {
  title: 'Blocks/Video Player',
};

const Template = () => {
  const block = document.createElement('div');
  block.classList.add('video-player');

  const videoPlayer = ['youtube', 'wopPRfeeCeQ', 'This is youtube video', 'large'];

  block.innerHTML += `
      <div>
        <div>${videoPlayer[0]}</div>
      </div>
      <div>
        <div>${videoPlayer[1]}</div>
      </div>
      <div>
        <div>${videoPlayer[2]}</div>
      </div>
      <div>
        <div>${videoPlayer[3]}</div>
      </div>
  `;

  // Apply the decorate function
  decorate(block);

  // Return the decorated block
  return block;
};

export const Default = Template.bind({});
