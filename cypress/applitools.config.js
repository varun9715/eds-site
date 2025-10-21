const isRunningOnGHA = process.env.GITHUB_ACTIONS === 'true';

const envVariables = {
  ...process.env,
  ...(isRunningOnGHA
    ? { proxy: {
      url: process.env.https_proxy,
    } }
    : {}),
};

module.exports = {
  showLogs: false,
  failCypressOnDiff: true,
  ...envVariables,
  ignoreDisplacements: true,

  // Uncomment below if we get the Ultra Fast Grid subscription added
  // browser: [
  //   { width: 1024, height: 768, name: 'firefox' },
  //   { width: 1024, height: 768, name: 'chrome' },
  //   { width: 1024, height: 768, name: 'edgechromium' },
  // ],
};
