/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import './commands.js';
import registerCypressGrep from '@cypress/grep';
import '@applitools/eyes-cypress/commands';
import 'cypress-fail-fast';
import 'cypress-mochawesome-reporter/register';

registerCypressGrep();
