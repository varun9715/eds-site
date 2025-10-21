const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  DEFAULT_ENV: 'dev',
  DEFAULT_DEVICE: 'DESKTOP',
  MOBILE_DEVICE: 'MOBILE',
  BASE_CYPRESS_E2E_DIR: 'cypress/e2e',
  IGNORED_DIRECTORIES: new Set(['pages', 'node_modules', '.git', 'support']),
  VALID_ENVIRONMENTS: ['dev', 'stage', 'uat', 'test'],
  VALID_DEVICES: ['DESKTOP', 'MOBILE'],
  FILE_EXTENSION: '.cy.js',
  VERBOSE_LOGGING: process.env.VERBOSE === 'true',
};

const logger = {
  info: (message) => {
    if (CONFIG.VERBOSE_LOGGING) {
      console.error(`[INFO] ${message}`);
    }
  },
  warn: (message) => console.error(`[WARN] ${message}`),
  error: (message) => console.error(`[ERROR] ${message}`),
  debug: (message) => {
    if (CONFIG.VERBOSE_LOGGING) {
      console.error(`[DEBUG] ${message}`);
    }
  },
};

const validateConfig = (env, device) => {
  if (!CONFIG.VALID_ENVIRONMENTS.includes(env)) {
    throw new Error(
      `Invalid environment: "${env}". Valid options are: ${CONFIG.VALID_ENVIRONMENTS.join(', ')}`,
    );
  }

  if (!CONFIG.VALID_DEVICES.includes(device)) {
    throw new Error(
      `Invalid device: "${device}". Valid options are: ${CONFIG.VALID_DEVICES.join(', ')}`,
    );
  }
};

/**
 * Extracts tags from a Cypress test file using multiple methods
 */
const extractTagsFromFile = (fileContent, filePath) => {
  const tags = new Set();

  try {
    // Look for plain text tags in comments (// Tags.DEV)
    const commentTagRegex = /\/\/.*?(Tags\.\w+)/g;
    let match = commentTagRegex.exec(fileContent);
    while (match !== null) {
      tags.add(match[1]);
      match = commentTagRegex.exec(fileContent);
    }

    // Look for Cypress native tags in describe blocks
    const cypressTagRegex = /describe\s*\([^,]+,\s*\{\s*tags:\s*\[(.*?)\]/gs;
    const cypressMatches = fileContent.match(cypressTagRegex);
    if (cypressMatches) {
      cypressMatches.forEach((cypressMatch) => {
        const tagsArrayMatch = cypressMatch.match(/tags:\s*\[(.*?)\]/s);
        if (tagsArrayMatch) {
          const tagsContent = tagsArrayMatch[1];
          // Find all quoted strings
          const tagMatches = tagsContent.match(/'([^']+)'|"([^"]+)"/g);
          if (tagMatches) {
            tagMatches.forEach((tag) => {
              const cleanTag = tag.replace(/['"]/g, '');
              if (cleanTag.startsWith('Tags.')) {
                tags.add(cleanTag);
              }
            });
          }
        }
      });
    }

    //  Look for it() or context() with tags
    const itTagRegex = /(?:it|context)\s*\([^,]+,\s*\{\s*tags:\s*\[(.*?)\]/gs;
    const itMatches = fileContent.match(itTagRegex);
    if (itMatches) {
      itMatches.forEach((itMatch) => {
        const tagsArrayMatch = itMatch.match(/tags:\s*\[(.*?)\]/s);
        if (tagsArrayMatch) {
          const tagsContent = tagsArrayMatch[1];
          const tagMatches = tagsContent.match(/'([^']+)'|"([^"]+)"/g);
          if (tagMatches) {
            tagMatches.forEach((tag) => {
              const cleanTag = tag.replace(/['"]/g, '');
              if (cleanTag.startsWith('Tags.')) {
                tags.add(cleanTag);
              }
            });
          }
        }
      });
    }

    // Simple string search as fallback
    const simpleTagRegex = /Tags\.\w+/g;
    const simpleMatches = fileContent.match(simpleTagRegex);
    if (simpleMatches) {
      simpleMatches.forEach((tag) => tags.add(tag));
    }
  } catch (error) {
    logger.warn(`Error extracting tags from ${filePath}: ${error.message}`);
  }

  return Array.from(tags);
};

const shouldSkipFile = (fileContent) =>
  fileContent.includes('describe.skip') ||
  fileContent.includes('it.skip') ||
  fileContent.includes('context.skip');

/**
 * Recursively finds all Cypress test files with specific tags
 */
const getFilesWithTags = (dirPath, requiredTags, arrayOfFiles = []) => {
  if (!Array.isArray(requiredTags) || requiredTags.length === 0) {
    logger.warn(`No tags specified for directory: ${dirPath}`);
    return arrayOfFiles;
  }

  if (!fs.existsSync(dirPath)) {
    logger.warn(`Directory not found: ${dirPath}`);
    return arrayOfFiles;
  }

  let files;
  try {
    files = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (error) {
    logger.error(`Cannot read directory ${dirPath}: ${error.message}`);
    return arrayOfFiles;
  }

  let result = [...arrayOfFiles];

  files.forEach((file) => {
    const currentPath = path.join(dirPath, file.name);

    if (file.isDirectory()) {
      if (!CONFIG.IGNORED_DIRECTORIES.has(file.name)) {
        result = getFilesWithTags(currentPath, requiredTags, result);
      } else {
        logger.debug(`Skipping ignored directory: ${file.name}`);
      }
    } else if (file.name.endsWith(CONFIG.FILE_EXTENSION)) {
      try {
        const fileContent = fs.readFileSync(currentPath, 'utf8');

        const fileTags = extractTagsFromFile(fileContent, currentPath);
        const hasAllRequiredTags = requiredTags.every((tag) => fileTags.includes(tag));

        logger.debug(`File: ${currentPath}`);
        logger.debug(`  Found tags: ${JSON.stringify(fileTags)}`);
        logger.debug(`  Required tags: ${JSON.stringify(requiredTags)}`);
        logger.debug(`  Has all required: ${hasAllRequiredTags}`);

        if (hasAllRequiredTags) {
          result.push(currentPath);
          logger.info(`Added spec: ${currentPath}`);
        }
      } catch (readError) {
        logger.error(`Error reading file ${currentPath}: ${readError.message}`);
      }
    }
  });

  return result;
};

const getAllCypressFiles = (dirPath, arrayOfFiles = []) => {
  if (!fs.existsSync(dirPath)) {
    logger.warn(`Directory not found: ${dirPath}`);
    return arrayOfFiles;
  }

  let files;
  try {
    files = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (error) {
    logger.error(`Cannot read directory ${dirPath}: ${error.message}`);
    return arrayOfFiles;
  }

  let result = [...arrayOfFiles];

  files.forEach((file) => {
    const currentPath = path.join(dirPath, file.name);

    if (file.isDirectory()) {
      if (!CONFIG.IGNORED_DIRECTORIES.has(file.name)) {
        result = getAllCypressFiles(currentPath, result);
      }
    } else if (file.name.endsWith(CONFIG.FILE_EXTENSION)) {
      try {
        const fileContent = fs.readFileSync(currentPath, 'utf8');

        if (!shouldSkipFile(fileContent)) {
          result.push(currentPath);
        }
      } catch (readError) {
        logger.error(`Error reading file ${currentPath}: ${readError.message}`);
      }
    }
  });

  return result;
};

const getRequiredTags = (env, device) => {
  const envTagMap = {
    dev: 'Tags.DEV',
    stage: 'Tags.STG',
    uat: 'Tags.UAT',
    test: 'Tags.TEST',
  };

  return [envTagMap[env], `Tags.${device}`];
};

/**
 * Main function to discover test files
 */
const discoverTestFiles = () => {
  try {
    const env = (process.env.CYPRESS_ENV || CONFIG.DEFAULT_ENV).toLowerCase();
    let device;
    if (
      process.env.CYPRESS_DEVICE === undefined ||
      process.env.CYPRESS_DEVICE === 'desktop'
    ) {
      device = CONFIG.DEFAULT_DEVICE;
    } else {
      device = CONFIG.MOBILE_DEVICE;
    }

    validateConfig(env, device);

    logger.info('=== CYPRESS SPECS ===');
    logger.info(`Environment: ${env}`);
    logger.info(`Device: ${device}`);
    logger.info(`Base directory: ${CONFIG.BASE_CYPRESS_E2E_DIR}`);

    const requiredTags = getRequiredTags(env, device);
    let specs = getFilesWithTags(CONFIG.BASE_CYPRESS_E2E_DIR, requiredTags);

    logger.info(`Required tags: ${JSON.stringify(requiredTags)}`);
    logger.info(`Found ${specs.length} matching specs with tags`);

    // Fallback strategies
    if (specs.length === 0) {
      logger.warn('No specs found with required tags. Trying fallback strategies...');

      const envOnlyTags = [requiredTags[0]];
      specs = getFilesWithTags(CONFIG.BASE_CYPRESS_E2E_DIR, envOnlyTags);
      logger.info(`Found ${specs.length} specs with environment tag only`);

      if (specs.length === 0) {
        logger.warn('No specs found with environment tag. Using all available specs');
        specs = getAllCypressFiles(CONFIG.BASE_CYPRESS_E2E_DIR);
        logger.info(`Found ${specs.length} total specs`);
      }
    }

    if (specs.length === 0) {
      logger.warn('No .cy.js files found. Using glob pattern as final fallback');
      specs = [`${CONFIG.BASE_CYPRESS_E2E_DIR}/**/*${CONFIG.FILE_EXTENSION}`];
    }

    logger.info(`Final specs count: ${specs.length}`);
    if (CONFIG.VERBOSE_LOGGING) {
      logger.debug(`Final specs: ${JSON.stringify(specs, null, 2)}`);
    }

    const specObjects = specs.map((specPath) => ({
      spec: specPath,
      name: path.basename(specPath),
    }));

    process.stdout.write(`${JSON.stringify(specObjects)}\n`);
    return specs;
  } catch (error) {
    logger.error(`Discovery failed: ${error.message}`);

    const fallbackSpecs = [`${CONFIG.BASE_CYPRESS_E2E_DIR}/**/*${CONFIG.FILE_EXTENSION}`];
    logger.warn(`Using fallback specs: ${JSON.stringify(fallbackSpecs)}`);
    process.stdout.write(`${JSON.stringify(fallbackSpecs)}\n`);
    return fallbackSpecs;
  }
};

// CLI usage helper
const printUsage = () => {
  console.log(`
Cypress Test File Discovery Script

Usage:
  node cypress-discover.js

Environment Variables:
  CYPRESS_ENV     - Environment (dev, stage, uat, test) [default: dev]
  CYPRESS_DEVICE  - Device type (desktop, mobile) [default: desktop]
  VERBOSE         - Enable verbose logging (true/false) [default: false]

Examples:
  CYPRESS_ENV=stage node cypress-discover.js
  CYPRESS_ENV=uat CYPRESS_DEVICE=mobile node cypress-discover.js
  VERBOSE=true CYPRESS_ENV=test node cypress-discover.js

Tag Format in Test Files:
  // Comment tags: // Tags.DEV Tags.DESKTOP
  // Describe tags: describe('test', { tags: ['Tags.DEV', 'Tags.DESKTOP'] }, () => {})
  // It tags: it('test', { tags: ['Tags.DEV'] }, () => {})
`);
};

// Handle CLI arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  printUsage();
  process.exit(0);
}

module.exports = {
  discoverTestFiles,
  getFilesWithTags,
  getAllCypressFiles,
  extractTagsFromFile,
  CONFIG,
};

if (require.main === module) {
  discoverTestFiles();
}
