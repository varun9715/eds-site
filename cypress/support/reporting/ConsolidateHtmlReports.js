/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
/* eslint-disable no-template-curly-in-string */
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');

const DESTINATION_REPORT_DIR = 'cypress/reports/html';

async function ensureDirectory(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

async function copyFileOrDir(src, dest, options = {}) {
  const stat = await fs.stat(src);
  if (stat.isDirectory()) {
    await ensureDirectory(dest);
    const entries = await fs.readdir(src, { withFileTypes: true });
    await Promise.all(
      entries.map(async (entry) => {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        await copyFileOrDir(srcPath, destPath, options);
      }),
    );
  } else if (stat.isFile()) {
    if (options.overwrite) {
      await fs.copyFile(src, dest);
    } else {
      try {
        await fs.access(dest);
      } catch (e) {
        await fs.copyFile(src, dest);
      }
    }
  }
}

// Get all individual report folders (e.g., cypress-report-0/html, cypress-report-1/html)
async function getSourceReportFolders(artifactsRoot) {
  console.log(`Searching for source report folders within: ${artifactsRoot}`);
  const foundFolders = [];

  try {
    const entries = await fs.readdir(artifactsRoot, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        if (entry.isDirectory() && entry.name.startsWith('cypress-report-')) {
          const reportDir = path.join(artifactsRoot, entry.name);
          const jsonPath = path.join(reportDir, 'report.json');
          try {
            const stat = await fs.stat(jsonPath);
            if (stat.isFile()) {
              foundFolders.push(reportDir);
            }
          } catch (err) {
            console.warn(`⚠️ 'report.json' not found in ${reportDir}. Skipping.`);
          }
        }
      }),
    );
  } catch (error) {
    console.error(
      `Error reading artifacts directory "${artifactsRoot}": ${error.message}`,
    );
    throw error;
  }

  if (foundFolders.length > 0) {
    console.log(`✅ Found ${foundFolders.length} source report folders:`);
    foundFolders.forEach((folder) => console.log(`   - ${folder}`));
  }
  return foundFolders;
}

async function pathExists(entityPath) {
  try {
    await fs.access(entityPath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

function getAndValidateArtifactsDirectory() {
  const artifactsDir = process.env.ARTIFACTS_DIR;
  if (!artifactsDir) {
    console.error('❌ Error: ARTIFACTS_DIR environment variable is not set.');
    console.error('Please ensure the CI workflow passes ARTIFACTS_DIR to the script.');
    console.error('(e.g.: env: ARTIFACTS_DIR: ${{ github.workspace }}/artifacts).');
    process.exit(1); // Exit process as this is a critical configuration error
  }
  return artifactsDir;
}

async function ensureFinalReportDestination() {
  console.log(`📁 Ensuring final report destination exists: ${DESTINATION_REPORT_DIR}`);
  await ensureDirectory(DESTINATION_REPORT_DIR);
  console.log('✅ Final report destination ready.');
}

async function processArtifactsOfType(artifactsRoot, type, subfolderName) {
  console.log(`\n📦 Phase: Processing ${type}`);
  try {
    const allEntries = await fs.readdir(artifactsRoot, { withFileTypes: true });

    const relevantFolders = allEntries.filter(
      (entry) => entry.isDirectory() && entry.name.startsWith(`cypress-${type}-`),
    );

    if (relevantFolders.length === 0) {
      console.log(`No cypress-${type}-* folders found. Skipping ${type} copy.`);
      return;
    }

    await Promise.all(
      relevantFolders.map(async (artifactEntry) => {
        const artifactName = artifactEntry.name;
        const reportName = artifactName.replace(`cypress-${type}`, 'cypress-report');

        const correspondingReportEntry = allEntries.find(
          (entry) => entry.isDirectory() && entry.name === reportName,
        );

        if (correspondingReportEntry) {
          const sourcePath = path.join(artifactsRoot, artifactName);
          const destinationPath = path.join(
            artifactsRoot,
            reportName,
            'html',
            subfolderName,
          );

          await ensureDirectory(destinationPath);
          console.log(`Copying ${type} from '${sourcePath}' to '${destinationPath}'`);
          await copyFileOrDir(sourcePath, destinationPath, { overwrite: true });
          console.log(`✅ Successfully copied ${type} from '${artifactName}'`);
        } else {
          console.warn(
            `⚠️ No matching report folder for '${artifactName}'. Skipping ${type} copy.`,
          );
        }
      }),
    );

    console.log(`✅ ${type} copying process completed.`);
  } catch (error) {
    console.error(`❌ Error copying ${type} into report folders:`, error.message);
    throw error;
  }
}

async function filterExistingJsonReports(jsonReportPaths) {
  const validJsonReportPaths = [];
  await Promise.all(
    jsonReportPaths.map(async (reportPath) => {
      if (await pathExists(reportPath)) {
        validJsonReportPaths.push(reportPath);
      } else {
        console.warn(`⚠️ JSON report not found at: ${reportPath}. Skipping.`);
      }
    }),
  );
  return validJsonReportPaths;
}

async function handleNoValidJsonReports(mergedJsonReportPath) {
  console.warn(
    '⚠️ No valid JSON reports found to merge. Creating an empty merged JSON report.',
  );
  await fs.writeFile(mergedJsonReportPath, JSON.stringify({}, null, 4));
}

async function generateMergedJsonReport(sourceHtmlReportFolders, mergedJsonReportPath) {
  const jsonReportPaths = sourceHtmlReportFolders.map((folder) =>
    path.join(folder, 'report.json'),
  );
  const validJsonReportPaths = await filterExistingJsonReports(jsonReportPaths);
  if (validJsonReportPaths.length === 0) {
    await handleNoValidJsonReports(mergedJsonReportPath);
    return;
  }
  const mergeCommand = `npx mochawesome-merge ${validJsonReportPaths.map((p) => `"${p}"`).join(' ')} > "${mergedJsonReportPath}"`;
  console.log(`Executing: ${mergeCommand}`);

  return new Promise((resolve, reject) => {
    exec(mergeCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Mochawesome JSON report merging failed: ${error.message}`);
        if (stderr) console.error(`Stderr: ${stderr}`);
        reject(new Error(`Mochawesome JSON report merging failed: ${error.message}`));
      } else {
        console.log('✅ Mochawesome JSON reports merged successfully.');
        resolve();
      }
    });
  });
}

async function createEmptyPlaceholderReport() {
  console.warn(
    '⚠️ No source report folders found for consolidation. Creating an empty placeholder report.',
  );
  const emptyJsonContent = JSON.stringify(
    {
      stats: {
        suites: 0,
        tests: 0,
        passes: 0,
        pending: 0,
        failures: 0,
        start: null,
        end: null,
        duration: 0,
      },
      results: [],
    },
    null,
    4,
  );

  const emptyHtmlContent =
    '<html><head><title>No Cypress Reports Found</title></head><body><h1>No Cypress Test Reports Found</h1><p>It appears no test reports were generated or downloaded. Please check your Cypress configuration and CI workflow.</p></body></html>';
  await ensureDirectory(DESTINATION_REPORT_DIR);
  await fs.writeFile(path.join(DESTINATION_REPORT_DIR, 'index.json'), emptyJsonContent);
  await fs.writeFile(path.join(DESTINATION_REPORT_DIR, 'index.html'), emptyHtmlContent);
  console.log('✅ Empty placeholder report created.');
}

async function handleNoSourceReports(sourceHtmlReportFolders) {
  if (sourceHtmlReportFolders.length === 0) {
    await createEmptyPlaceholderReport();
    console.log('🎉 Report consolidation completed (EMPTY placeholder created).');
    return true;
  }
  return false;
}

async function generateFinalHtmlReport(mergedJsonReportPath, mergedHtmlReportPath) {
  const assetsOutputFolder = path.join(DESTINATION_REPORT_DIR, 'assets');
  await ensureDirectory(assetsOutputFolder);

  const margeCommand = `npx marge ${mergedJsonReportPath} --reportDir ${DESTINATION_REPORT_DIR} --assetsDir ${assetsOutputFolder} --reportPageTitle "Consolidated Cypress Test Report" --inlineAssets`;
  console.log(`🚀🚀 Executing: ${margeCommand}`);

  return new Promise((resolve, reject) => {
    exec(margeCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Mochawesome HTML report generation failed: ${error.message}`);
        if (stderr) console.error(`Stderr: ${stderr}`);
        reject(new Error(`Mochawesome HTML report generation failed: ${error.message}`));
      } else {
        console.log(`
          🎉🎉🎉------------------------------------------------🎉🎉🎉
          ✅ Mochawesome HTML report generated successfully!
          📄 Report path: ${mergedHtmlReportPath}
          🎉🎉🎉------------------------------------------------🎉🎉🎉
          `);
        resolve();
      }
    });
  });
}

async function aggregateAssetsIntoFinalReport(sourceHtmlReportFolders, assetFolderName) {
  console.log(`\n📦 Aggregating all ${assetFolderName} into final report directory...`);
  const destination = path.join(DESTINATION_REPORT_DIR, assetFolderName);
  await ensureDirectory(destination);

  for (const folder of sourceHtmlReportFolders) {
    const sourcePath = path.join(folder, assetFolderName);
    if (await pathExists(sourcePath)) {
      const files = await fs.readdir(sourcePath);
      await Promise.all(
        files.map(async (file) => {
          const src = path.join(sourcePath, file);
          const dest = path.join(destination, file);
          await copyFileOrDir(src, dest, { overwrite: true });
        }),
      );
      console.log(
        `✅ Copied ${files.length} ${assetFolderName} files from ${sourcePath}`,
      );
    }
  }
}

async function consolidateReports() {
  try {
    console.log('🚀🚀🚀 Starting report consolidation process...');
    const artifactsDir = getAndValidateArtifactsDirectory();
    await ensureFinalReportDestination();
    await processArtifactsOfType(artifactsDir, 'videos', 'videos');
    await processArtifactsOfType(artifactsDir, 'screenshots', 'screenshots');

    const sourceHtmlReportFolders = await getSourceReportFolders(artifactsDir);
    if (await handleNoSourceReports(sourceHtmlReportFolders)) return;

    const mergedJsonReportPath = path.join(DESTINATION_REPORT_DIR, 'index.json');
    const mergedHtmlReportPath = path.join(DESTINATION_REPORT_DIR, 'index.html');

    await generateMergedJsonReport(sourceHtmlReportFolders, mergedJsonReportPath);
    await aggregateAssetsIntoFinalReport(sourceHtmlReportFolders, 'videos');
    await aggregateAssetsIntoFinalReport(sourceHtmlReportFolders, 'screenshots');

    await generateFinalHtmlReport(mergedJsonReportPath, mergedHtmlReportPath);

    console.log('🎉 Report consolidation completed successfully.');
  } catch (error) {
    console.error('❌ Error during report consolidation:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  consolidateReports();
}

module.exports = {
  //
  ensureDirectory,
  copyFileOrDir,
  pathExists,
  getAndValidateArtifactsDirectory,
  ensureFinalReportDestination,
  createEmptyPlaceholderReport,
  handleNoSourceReports,
  getSourceReportFolders,
  filterExistingJsonReports,
  handleNoValidJsonReports,
  generateMergedJsonReport,
  aggregateAssetsIntoFinalReport,
  generateFinalHtmlReport,
  consolidateReports,
};
