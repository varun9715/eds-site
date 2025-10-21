import decorate from './link-list.js';
import './link-list.css';

export default {
  title: 'Blocks/Link List',
};

const Template = () => {
  const block = document.createElement('div');
  block.classList.add('link-list');
  block.classList.add('hyper-links');

  const data = [
    'Link Item 1',
    'Link Item 2',
    'Link Item 3',
    'Link Item 4',
    'Link Item 5',
  ];

  const listData = ['Link list', 'fixedList', '', '', '', '', ...data];

  block.innerHTML += `

    <div>
      <div>
        <h2 id="requested-page-1">${listData[0]}</h2>
      </div>
    </div>
    <div>
      <div>${listData[1]}</div>
    </div>
    <div>
      <div>${listData[2]}</div>
    </div>
    <div>
      <div>${listData[3]}</div>
    </div>
    <div>
      <div>${listData[4]}</div>
    </div>
    <div>
      <div>${listData[5]}</div>
    </div>
    <div>
      <div><a href="/content/eds-site">${data[0]}</a></div>
    </div>
    <div>
      <div><a href="/content/eds-site">${data[1]}</a></div>
    </div>
    <div>
      <div><a href="/content/eds-site">${data[2]}</a></div>
    </div>
    <div>
      <div><a href="/content/eds-site">${data[3]}</a></div>
    </div>
    <div>
      <div><a href="/content/eds-site">${data[4]}</a></div>
    </div>`;

  // Apply the decorate function
  decorate(block);

  // Return the decorated block
  return block;
};

export const Default = Template.bind({});
