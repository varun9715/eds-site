const getAllBrowsers = () => {
  const browserEnvVar = process.env.CYPRESS_BROWSER || 'electron';
  let browsers = browserEnvVar
    .split(',')
    .map((browser) => browser.trim())
    .filter((browser) => browser !== '');

  if (browsers.length === 0) {
    browsers = ['electron'];
  }
  return browsers;
};

try {
  const browsers = getAllBrowsers();
  process.stdout.write(`${JSON.stringify(browsers)}\n`);
} catch (error) {
  process.stderr.write(`Error: ${error.message}\n`);
  process.exit(1);
}

module.exports = getAllBrowsers;
