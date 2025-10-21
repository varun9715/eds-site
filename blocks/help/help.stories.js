import decorate from './help.js';
import './help.css';

export default {
  title: 'Components/Help',
};

const Template = () => {
  const block = document.createElement('div');
  block.classList.add('help');

  // Array of help data
  const helpData = [
    'https://help.qantas.com/support/s/',
    'Help',
    '/assets/icons/alert/runway_icon_question_mark.svg',
  ];

  block.innerHTML += `
    <div>
      <div><a href="${helpData[2]}">https://qrb-136--a244-aem-eds-tech-spikes--qantas-cloud.aem.live/assets/icons/alert/runway_icon_question_mark.svg</a></div>
    </div>
    <div>
      <div><p>${helpData[1]}</p></div>
    </div>
    <div>
      <div><a href="${helpData[0]}">https://help.qantas.com/support/s/</a></div>
    </div>`;

  // Apply the decorate function
  decorate(block);

  // Return the decorated block
  return block;
};

export const Default = Template.bind({});
