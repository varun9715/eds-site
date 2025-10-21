function logCypressConfig(config, options = {}) {
  const { isParallelRun = false, isRunningOnGHA = false, jobIndex = 'N/A' } = options;

  const {
    baseUrl,
    videoCompression,
    retries = {},
    e2e = {},
    reporterOptions = {},
    env = {},
  } = config;

  console.log('\n================= 🔧 Cypress Run Configuration =================');
  console.log(`🌍 CYPRESS_ENV:           ${process.env.CYPRESS_ENV || 'N/A'}`);
  console.log(`🌿 BRANCH_NAME:           ${process.env.BRANCH_NAME || 'N/A'}`);
  console.log(`🧪 Tags:                  ${env.grepTags || 'N/A'}`);
  console.log(`🚀 baseUrl:               ${baseUrl || 'N/A'}`);
  console.log(`📡 edsUrl:                ${env.edsUrl || 'N/A'}`);
  console.log(`📝 authorUrl:             ${env.authorUrl || 'N/A'}`);
  console.log(`🛠 universalEditorUrl:    ${env.universalEditorUrl || 'N/A'}`);
  console.log(`💾 Retries:               ${retries.runMode ?? 'N/A'}`);
  console.log(`📹 Video Compression:     ${videoCompression ?? 'N/A'}`);
  console.log(`📂 Spec Pattern:          ${e2e.specPattern || 'N/A'}`);
  console.log(
    `📊 Report Dir:            ${reporterOptions.reportDir || 'cypress/reports'}`,
  );
  console.log(`🏃 Parallel Run:          ${isParallelRun}`);
  console.log(`🏗 GitHub Actions:        ${isRunningOnGHA}`);
  console.log(`📦 Job Index:             ${jobIndex}`);
  console.log('===============================================================\n');
}

module.exports = { logCypressConfig };
