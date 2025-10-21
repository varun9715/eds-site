import '../../styles/styles.css';
import './disclaimer.css';
import decorate from './disclaimer.js';
import { buildDisclaimers } from './disclaimer-loader.js';

export default {
  title: 'Blocks/Disclaimer',
  argTypes: {
    runmode: {
      control: { type: 'select' },
      options: ['author', 'preview'],
      defaultValue: 'preview',
      description: 'Switch between author and preview mode',
    },
    title: { control: 'text', defaultValue: 'Disclaimer Title' },
    bodyText: { control: 'text', defaultValue: 'Sample disclaimer body text.' },
    disclaimerData: {
      control: 'object',
      description:
        'Array of disclaimers. Each item should have type ("manual" or "generic"), id, and description.',
      table: {
        type: {
          summary: 'Array<{type: "manual" | "generic", id: string, description: string}>',
        },
      },
    },
    disclaimerCFData: {
      control: 'object',
      description: 'Array of disclaimer content fragment data objects.',
      table: {
        type: {
          summary: `Array<{
            _variation: string,
            disclaimer_id: string,
            disclaimer_description: { html: string, plaintext: string },
            _id: string,
            _path: string,
            _tags: Array,
            __typename: string,
            _metadata: { stringMetadata: Array<{ name: string, value: string, __typename: string }> }
          }>`,
        },
      },
    },
  },
};

const Template = (args) => {
  // Set window.hlx.runmode based on mode
  window.hlx = window.hlx || {};
  window.hlx.runmode = args.runmode;

  const main = document.createElement('main');

  // Section with body text
  const section = document.createElement('div');
  section.classList.add('section');
  section.innerHTML = args.bodyText;
  main.append(section);

  // Section with disclaimer block
  const section2 = document.createElement('div');
  section2.classList.add('section');

  const block = document.createElement('div');
  block.classList.add('disclaimer', 'block');

  // Title
  const titleDiv = document.createElement('div');
  const titleInnerDiv = document.createElement('div');
  const h2 = document.createElement('h2');
  h2.textContent = args.title || '';
  titleInnerDiv.appendChild(h2);
  titleDiv.appendChild(titleInnerDiv);
  block.appendChild(titleDiv);

  // Render disclaimers from disclaimerData array
  if (Array.isArray(args.disclaimerData)) {
    args.disclaimerData.forEach((disclaimer) => {
      const item = document.createElement('div');
      item.innerHTML = `
        <div>${disclaimer.type || ''}</div>
        <div>${disclaimer.id || ''}</div>
        <div>${disclaimer.description || ''}</div>
      `;
      block.appendChild(item);
    });
  }

  // Decorate the block
  decorate(block);

  // Append the block to section2
  section2.appendChild(block);
  main.append(section2);

  // Wait until main is added to the DOM before calling loadDisclaimers
  setTimeout(() => {
    buildDisclaimers(main, args.disclaimerCFData);
  }, 0);

  return main;
};

const itemTemplate = {
  runmode: 'preview',
  title: 'Important Information',
  disclaimerCFData: [
    {
      _variation: 'au',
      disclaimer_id: 'internet',
      disclaimer_description: {
        html: '<p>Global Disclaimer - Internet - Content Fragment from australia variation</p>',
        plaintext:
          'Global Disclaimer - Internet Content - Fragment from australia variation',
      },
      _id: '4a6c85bc-c1bb-4066-83c1-9ef3e44b0c65',
      _path: '/content/dam/qcom/content-fragments/en/disclaimers/internet',
      _tags: [],
      __typename: 'DisclaimerModel',
      _metadata: {
        stringMetadata: [
          {
            name: 'title',
            value: 'internet',
            __typename: 'StringMetadata',
          },
          {
            name: 'description',
            value: '',
            __typename: 'StringMetadata',
          },
          {
            name: 'cq:lastReplicationAction',
            value: 'Activate',
            __typename: 'StringMetadata',
          },
        ],
      },
    },
    {
      _variation: 'master',
      disclaimer_id: 'internet',
      disclaimer_description: {
        html: '<p>Global Disclaimer - Internet - Content Fragment from master variation</p>',
        plaintext:
          'Global Disclaimer - Internet - Content Fragment from master variation',
      },
      _id: '4a6c85bc-c1bb-4066-83c1-9ef3e44b0c65',
      _path: '/content/dam/qcom/content-fragments/en/disclaimers/internet',
      _tags: [],
      __typename: 'DisclaimerModel',
      _metadata: {
        stringMetadata: [
          {
            name: 'title',
            value: 'internet',
            __typename: 'StringMetadata',
          },
          {
            name: 'description',
            value: '',
            __typename: 'StringMetadata',
          },
          {
            name: 'cq:lastReplicationAction',
            value: 'Activate',
            __typename: 'StringMetadata',
          },
        ],
      },
    },
    {
      _variation: 'au',
      disclaimer_id: 'park',
      disclaimer_description: {
        html: '<p>Global Disclaimer - Park - Content Fragment - AU EN</p>',
        plaintext: 'Global Disclaimer - Park - Content Fragment - AU EN',
      },
      _id: '4977793f-ba18-46a1-ae3d-dc3838b02769',
      _path: '/content/dam/qcom/content-fragments/en/disclaimers/park',
      _tags: [],
      __typename: 'DisclaimerModel',
      _metadata: {
        stringMetadata: [
          {
            name: 'title',
            value: 'park',
            __typename: 'StringMetadata',
          },
          {
            name: 'description',
            value: '',
            __typename: 'StringMetadata',
          },
          {
            name: 'cq:lastReplicationAction',
            value: 'Activate',
            __typename: 'StringMetadata',
          },
        ],
      },
    },
    {
      _variation: 'master',
      disclaimer_id: 'park',
      disclaimer_description: {
        html: '<p>Global Disclaimer - Park - Content Fragment - Master EN</p>',
        plaintext: 'Global Disclaimer - Park - Content Fragment - Master EN',
      },
      _id: '4977793f-ba18-46a1-ae3d-dc3838b02769',
      _path: '/content/dam/qcom/content-fragments/en/disclaimers/park',
      _tags: [],
      __typename: 'DisclaimerModel',
      _metadata: {
        stringMetadata: [
          {
            name: 'title',
            value: 'park',
            __typename: 'StringMetadata',
          },
          {
            name: 'description',
            value: '',
            __typename: 'StringMetadata',
          },
          {
            name: 'cq:lastReplicationAction',
            value: 'Activate',
            __typename: 'StringMetadata',
          },
        ],
      },
    },
  ],
};

export const Default = Template.bind({});
Default.args = {
  ...itemTemplate,
  bodyText: `
    <h5>Shows all types of disclaimers (Generic/Manual/Global).</h5>
    <p>This is a sample text where "Park" Content fragment is referenced <a href="#d-park">Park CF -  Global Disclaimer</a>.</p>
    <p>This is a sample text where "Internet" Content fragment is referenced <a href="#d-internet">Internet CF -  Global Disclaimer</a>.</p>
    <p>This is a sample text where "Generic 1" disclaimer is referenced </p>
    <p>This is a sample text where "Manual 2" disclaimer is referenced <a href="#d-manual-2">Manual Disclaimer 2</a>.</p>
    <p>This is a sample text where "Generic 2" disclaimer is referenced <a href="#d-generic-2">Generic Disclaimer 2</a></p>
    <p>This is a sample text where "Manual 1" disclaimer is referenced <a href="#d-manual-1">Manual Disclaimer 1</a>.</p>
  `,
  disclaimerData: [
    {
      type: 'generic',
      id: '',
      description:
        'Generic Disclaimer 1: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
    {
      type: 'generic',
      id: '',
      description:
        'Generic Disclaimer 2: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
    {
      type: 'manual',
      id: 'd-manual-1',
      description:
        'Manual Disclaimer 1: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
    {
      type: 'manual',
      id: 'd-manual-2',
      description:
        'Manual Disclaimer 2: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
  ],
};

export const Generic = Template.bind({});
Generic.args = {
  runmode: itemTemplate.runmode,
  title: itemTemplate.title,
  disclaimerCFData: [],
  bodyText: `
    <h5>Shows only 'Generic' disclaimers</h5>
    <p>This is a sample text where "Generic 2" disclaimer is referenced</p>
    <p>This is a sample text where "Generic 1" disclaimer is referenced</p>
  `,
  disclaimerData: [
    {
      type: 'generic',
      id: '',
      description:
        'Generic Disclaimer 1: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
    {
      type: 'generic',
      id: '',
      description:
        'Generic Disclaimer 2: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
  ],
};

export const GenericWithBackToContent = Template.bind({});
GenericWithBackToContent.args = {
  runmode: itemTemplate.runmode,
  title: itemTemplate.title,
  disclaimerCFData: [],
  bodyText: `
    <h5>Shows only 'Generic' disclaimers with 'Back to Content' link</h5>
    <p>This is a sample text where "Generic 2" disclaimer is referenced <a href="#d-generic-2">Generic 2</a>.</p>
    <p>This is a sample text where "Generic 1" disclaimer is referenced <a href="#d-generic-1">Generic 1</a>.</p>
  `,
  disclaimerData: [
    {
      type: 'generic',
      id: '',
      description:
        'Generic Disclaimer 1: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
    {
      type: 'generic',
      id: '',
      description:
        'Generic Disclaimer 2: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
  ],
};

export const Manual = Template.bind({});
Manual.args = {
  runmode: itemTemplate.runmode,
  title: itemTemplate.title,
  disclaimerCFData: [],
  bodyText: `
    <h5>Shows only 'Manual' disclaimers</h5>
    <p>This is a sample text where "Manual 1" disclaimer is referenced</p>
    <p>This is a sample text where "Manual 2" disclaimer is referenced</p>
  `,
  disclaimerData: [
    {
      type: 'manual',
      id: 'd-manual-1',
      description:
        'Manual Disclaimer 1: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
    {
      type: 'manual',
      id: 'd-manual-2',
      description:
        'Manual Disclaimer 2: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
  ],
};

export const ManualWithBackToContent = Template.bind({});
ManualWithBackToContent.args = {
  runmode: itemTemplate.runmode,
  title: itemTemplate.title,
  disclaimerCFData: [],
  bodyText: `
    <h5>Shows only 'Manual' disclaimers with 'Back to Content' link</h5>
    <p>This is a sample text where "Manual 1" disclaimer is referenced <a href="#d-manual-1">Manual 1</a>.</p>
    <p>This is a sample text where "Manual 2" disclaimer is referenced <a href="#d-manual-2">Manual 2</a>.</p>
  `,
  disclaimerData: [
    {
      type: 'manual',
      id: 'd-manual-1',
      description:
        'Manual Disclaimer 1: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
    {
      type: 'manual',
      id: 'd-manual-2',
      description:
        'Manual Disclaimer 2: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
  ],
};

export const Global = Template.bind({});
Global.args = {
  ...itemTemplate,
  bodyText: `
    <h5>Shows only 'Global' disclaimers</h5>
    <p>This is a sample text where "Park" Content fragment is referenced <a href="#d-park">Park CF</a>.</p>
    <p>This is a sample text where "Internet" Content fragment is referenced <a href="#d-internet">Internet CF</a>.</p>
  `,
  disclaimerData: [],
};

export const GenericManual = Template.bind({});
GenericManual.args = {
  runmode: itemTemplate.runmode,
  title: itemTemplate.title,
  disclaimerCFData: [],
  bodyText: `
    <h5>Shows only 'Generic and Manual' disclaimers</h5>
    <p>This is a sample text where "Generic 2" disclaimer is referenced </p>
    <p>This is a sample text where "Generic 1" disclaimer is referenced </p>
    <p>This is a sample text where "Manual 1" disclaimer is referenced <a href="#d-manual-1">Manual 1</a>.</p>
    <p>This is a sample text where "Manual 2" disclaimer is referenced <a href="#d-manual-2">Manual 2</a>.</p>
  `,
  disclaimerData: [
    {
      type: 'generic',
      id: '',
      description:
        'Generic Disclaimer 1: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
    {
      type: 'generic',
      id: '',
      description:
        'Generic Disclaimer 2: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
    {
      type: 'manual',
      id: 'd-manual-1',
      description:
        'Manual Disclaimer 1: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
    {
      type: 'manual',
      id: 'd-manual-2',
      description:
        'Manual Disclaimer 2: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
  ],
};

export const GenericGlobal = Template.bind({});
GenericGlobal.args = {
  ...itemTemplate,
  bodyText: `
    <h5>Shows only 'Generic and Global' disclaimers</h5>
    <p>This is a sample text where "Generic 2" disclaimer is referenced </p>
    <p>This is a sample text where "Generic 1" disclaimer is referenced </p>
    <p>This is a sample text where "Park" Content fragment is referenced <a href="#d-park">Park CF</a>.</p>
    <p>This is a sample text where "Internet" Content fragment is referenced <a href="#d-internet">Internet CF</a>.</p>
  `,
  disclaimerData: [
    {
      type: 'generic',
      id: '',
      description:
        'Generic Disclaimer 1: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
    {
      type: 'generic',
      id: '',
      description:
        'Generic Disclaimer 2: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
  ],
};

export const ManualGlobal = Template.bind({});
ManualGlobal.args = {
  ...itemTemplate,
  bodyText: `
    <h5>Shows only 'Manual and Global' disclaimers</h5>
    <p>This is a sample text where "Park" Content fragment is referenced <a href="#d-park">Park CF</a>.</p>
    <p>This is a sample text where "Internet" Content fragment is referenced <a href="#d-internet">Internet CF</a>.</p>
    <p>This is a sample text where "Manual 2" disclaimer is referenced <a href="#d-manual-2">Manual 2</a>.</p>
    <p>This is a sample text where "Manual 1" disclaimer is referenced <a href="#d-manual-1">Manual 1</a>.</p>
  `,
  disclaimerData: [
    {
      type: 'manual',
      id: 'd-manual-1',
      description:
        'Manual Disclaimer 1: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
    {
      type: 'manual',
      id: 'd-manual-2',
      description:
        'Manual Disclaimer 2: description - Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
    },
  ],
};
