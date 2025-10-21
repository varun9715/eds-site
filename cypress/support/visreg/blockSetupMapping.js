/* eslint-disable import/prefer-default-export */
import HeroJson from '../../../blocks/hero/_hero';
import CardsJson from '../../../blocks/cards/_cards';

export const allBlocksSetup = [
  {
    blockName: 'Hero',
    hasChildBlock: false,
    blockAddContent: {
      name: HeroJson.definitions[0].id,
      xwalk: HeroJson.definitions[0].plugins.xwalk,
    },
    blockPatchConfigurationBody: [
      {
        op: 'replace',
        path: '/image',
        value: '/content/dam/qcom/peak-performance.png',
      },
      { op: 'replace', path: '/imageAlt', value: 'Dummy Alt Text For Hero Banner Image' },
      { op: 'replace', path: '/text', value: 'Dummy Text For Hero Banner Image' },
      { op: 'replace', path: '/heading', value: 'Hero Tittle' },
      {
        op: 'replace',
        path: '/imagePicker',
        value: '/content/dam/qcom/peak-performance.png',
      },
      { op: 'replace', path: '/imagePickerTitle', value: 'Image Picker Title -' },
      { op: 'replace', path: '/imageCaption', value: 'Image Caption' },
      { op: 'replace', path: '/introText', value: 'Hello Intro' },
    ],
  },
  {
    blockName: 'Cards',
    blockAddContent: {
      name: CardsJson.definitions[0].id,
      xwalk: CardsJson.definitions[0].plugins.xwalk,
    },
    blockPatchConfigurationBody: [],
    hasChildBlock: true,
    childBlockName: 'Card',
    childBlockAddContent: {
      name: CardsJson.definitions[1].id,
      xwalk: CardsJson.definitions[1].plugins.xwalk,
    },
    childBlockPatchConfigurationBody: [
      { op: 'replace', path: '/image', value: '/content/dam/qcom/hero.png' },
      { op: 'replace', path: '/text', value: 'Dummy Text For Card Image' },
    ],
  },
];
