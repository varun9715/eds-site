/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const fs = require('fs').promises;
// const fsSync = require('fs');
const path = require('path');

async function findTestResultFiles(startDir) {
  const resultPaths = [];

  async function recurse(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await recurse(entryPath);
      } else if (entry.name === 'testResults.json') {
        resultPaths.push(entryPath);
      }
    }
  }

  await recurse(startDir);
  return resultPaths;
}

function combineUniqueKeyValues(target, source) {
  const mergedArray = [...target, ...source];
  const uniqueMergedArray = mergedArray.filter(
    (value, index, self) => self.indexOf(value) === index,
  );
  return uniqueMergedArray;
}

function deepMerge(source, target) {
  Object.keys(source).forEach((key) => {
    if (key === '__proto__' || key === 'constructor') {
      return;
    }
    if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else if (typeof source[key] === 'number') {
      target[key] = (target[key] || 0) + source[key];
    } else if (Array.isArray(source[key])) {
      target[key] = combineUniqueKeyValues(target[key] || [], source[key]);
    } else {
      target[key] = source[key];
    }
  });
  return target;
}

async function aggregateTestResults(filePaths) {
  let mergedData = {};
  await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        console.log(`Reading file: ${filePath}`);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(fileContent);
        mergedData = deepMerge(jsonData, mergedData);
      } catch (error) {
        console.warn(
          `Warning: Could not read or parse file ${filePath}. Skipping. Error: ${error.message}`,
        );
      }
    }),
  );

  const outputPath = path.join('cypress', 'testResults.json');
  try {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(mergedData, null, 2));
    console.log(`✅ Successfully aggregated test results into ${outputPath}`);
  } catch (error) {
    console.error(
      `❌ Error writing aggregated results to ${outputPath}: ${error.message}`,
    );
    throw error;
  }
}

async function main() {
  const artifactsDir = process.env.ARTIFACTS_DIR;
  if (!artifactsDir) {
    console.error('❌ Error: ARTIFACTS_DIR environment variable is not set.');
    console.error('Please ensure the CI workflow passes ARTIFACTS_DIR to the script.');
    process.exit(1);
  }
  console.log(`🔍 Looking for testResults.json files under: ${artifactsDir}`);

  try {
    const filesToMerge = await findTestResultFiles(artifactsDir);

    if (filesToMerge.length === 0) {
      console.warn('⚠️ No testResults.json files found. Writing empty file.');
      const emptyOutput = path.join('cypress', 'testResults.json');
      await fs.mkdir(path.dirname(emptyOutput), { recursive: true });
      await fs.writeFile(emptyOutput, JSON.stringify({}, null, 2));
      return;
    }

    console.log(
      `📄 Found ${filesToMerge.length} file(s) to merge:\n${filesToMerge.join('\n')}`,
    );
    await aggregateTestResults(filesToMerge);
  } catch (err) {
    console.error('❌ Failed to aggregate test results:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  mergeObjects: deepMerge,
  mergeArrays: combineUniqueKeyValues,
  aggregateTestResults,
  main,
};
