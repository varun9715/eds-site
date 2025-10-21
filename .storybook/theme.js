import { create } from '@storybook/theming/create';
import logo from './logo.svg';

export default create({
  base: 'light',
  brandTitle: 'Qantas.com EDS Storybook',
  brandImage: logo,

  colorPrimary: '#df0000',
  colorSecondary: '#df0000',

  // // UI
  appBg: '#f2f1f0',
  appBorderColor: '#cccac8',
  appBorderRadius: 8,

  // // Typography
  fontBase: "'Qantas Sans', Helvetica, sans-serif",
  fontCode: 'Consolas, "Liberation Mono", Menlo, monospace',

  // // Toolbar default and active colors
  barSelectedColor: '#323232',
  barBg: '#f4f4f4',

  // // Form colors
  inputBg: '#fff',
  inputBorder: '#cccac8',
  inputTextColor: '#323232',
  inputBorderRadius: 8,
});
