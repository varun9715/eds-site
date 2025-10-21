/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-vars */
Cypress.on('uncaught:exception', () => false);
Cypress.on('log:added', (log) => {
  if (log.displayName || log.message) {
    console.log(`[${log.displayName}] ${log.message}`);
  }
});
const getAkamaiHeaders = () => {
  const headerKey = Cypress.env('AKAMAIHEADER');
  const headerValue = Cypress.env('AKAMAIHEADERPASSWORD');
  return headerKey && headerValue ? { [headerKey]: headerValue } : {};
};
const akamaiHeaders = getAkamaiHeaders();

// Additional headers that are required for the AEM bot detection bypass
const aemBotBypassHeaders = {
  'User-Agent': 'qantas-ui-tests ',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
};

beforeEach(() => {
  cy.intercept({ url: '**', middleware: true }, (req) => {
    const allHeaders = {
      ...akamaiHeaders,
      ...aemBotBypassHeaders,
    };
    Object.keys(allHeaders).forEach((key) => {
      req.headers[key] = allHeaders[key];
    });
    req.continue();
  });
});

Cypress.Commands.overwrite('visit', (originalFn, url, options = {}) =>
  originalFn(url, {
    ...options,
    headers: {
      ...options.headers,
      ...getAkamaiHeaders(),
      ...aemBotBypassHeaders,
    },
  }),
);

Cypress.Commands.overwrite('request', (originalFn, ...args) => {
  const options =
    typeof args[0] === 'object'
      ? args[0]
      : { method: args[0], url: args[1], body: args[2] };
  return originalFn({
    ...options,
    headers: {
      ...options.headers,
      ...getAkamaiHeaders(),
    },
  });
});
