const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ENVIRONMENT = process.env.CYPRESS_ENV || 'dev';
const BROWSER = process.env.CYPRESS_BROWSER || 'electron';
const FAILED_SPECS_FILE = path.join(process.cwd(), 'cypress', 'failed-specs.txt');

try {
  const failedSpecs = fs.readFileSync(FAILED_SPECS_FILE, 'utf8').trim();
  if (!failedSpecs) {
    console.log(
      `No failed tests found for ${ENVIRONMENT} environment - all tests passed!`,
    );
    process.exit(0);
  }
  console.log(`🔄 Rerunning failed specs for ${ENVIRONMENT} environment: ${failedSpecs}`);
  console.log(`Working directory: ${process.cwd()}`);

  const cypressCommand = `cypress run --e2e --config-file=cypress/cypress.config.js --env environmentName=${ENVIRONMENT} --spec "${failedSpecs}" --browser ${BROWSER}`;
  execSync(cypressCommand, {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: {
      ...process.env,
      CYPRESS_ENV: ENVIRONMENT,
    },
  });
  console.log(`✅ Rerun completed successfully for ${ENVIRONMENT} environment!`);
} catch (error) {
  console.error(
    `❌ Error during rerun process for ${ENVIRONMENT} environment:`,
    error.message,
  );
  process.exit(1);
}
