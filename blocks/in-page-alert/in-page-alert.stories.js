import decorate from './in-page-alert.js';
import './in-page-alert.css';

export default {
  title: 'Components/In Page Alert',
};

const Template = ({ alertType, alertText, captionText }) => {
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
  decorate(block);
  return block;
};

export const Information = Template.bind({});
Information.args = {
  alertType: 'information',
  alertText:
    'This is not a test, this is your Emergency Broadcast System. Announcing the commencement of the annual purge sanctioned by the U.S. Government.',
  captionText: 'Ends at 7:00am the following day.',
};

export const Alert = Template.bind({});
Alert.args = {
  alertType: 'alert',
  alertText:
    'This is not a test, this is your Emergency Broadcast System. Announcing the commencement of the annual purge sanctioned by the U.S. Government.',
  captionText: 'Last updated at 12:01pm',
};
