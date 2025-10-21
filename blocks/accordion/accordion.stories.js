import decorate from './accordion.js';
import './accordion.css';

export default {
  title: 'Blocks/Accordion',
};

const Template = () => {
  const block = document.createElement('div');
  block.classList.add('accordion');

  const data = [
    'How do I know my online booking is confirmed and what information is displayed in the email?',
    'question-two',
    'Topping cheesecake fruitcake jelly-o biscuit. Biscuit tart jelly beans dessert candy canes. Liquorice shortbread sweet tiramisu halvah cake.',
  ];

  const listData = ['h3', '', '', ...data];

  block.innerHTML += `


    <div>
      <div>${listData[0]}</div>
    </div>
    <div>
      <div>${listData[1]}</div>
    </div>
    <div>
      <div>${listData[2]}</div>
    </div>
    <div>
      <div>${data[0]}</div>
      <div>${data[1]}</div>
      <div>${data[2]}</div>
    </div>`;

  // Apply the decorate function
  decorate(block);

  // Return the decorated block
  return block;
};

export const Default = Template.bind({});
