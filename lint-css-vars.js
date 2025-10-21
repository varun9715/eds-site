const fs = require('fs');
const path = require('path');

const GLOBAL_CSS_FILES = ['styles/styles.css', 'styles/tokens.css'];
const TARGET_FOLDERS = ['styles', 'blocks', 'components'];

/**
 * Extracts all defined CSS custom properties from the given CSS content.
 */
function getDefinedVariables(cssContent) {
  const matches = cssContent.match(/--[\w-]+:/g);
  return matches ? matches.map((m) => m.replace(':', '').trim()) : [];
}

/**
 * Extracts all used CSS custom properties (via var(--variable)) from the given CSS content.
 */
function getUsedVariables(cssContent) {
  const matches = cssContent.match(/var\(--[\w-]+/g);
  return matches ? matches.map((m) => m.replace('var(', '').trim()) : [];
}

/**
 * Reads a CSS file and extracts defined and used variables.
 */
function processCssFile(filePath) {
  if (!fs.existsSync(filePath)) return { defined: [], used: [] };
  const content = fs.readFileSync(filePath, 'utf8');
  return {
    defined: getDefinedVariables(content),
    used: getUsedVariables(content),
  };
}

function getCSSFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((file) => {
    const filePath = path.join(dir, file.name);

    if (file.isDirectory()) {
      return getCSSFiles(filePath);
    }

    if (file.name.endsWith('.css')) {
      return [filePath];
    }

    return [];
  });
}

/**
 * Check for undefined variables.
 */
function lint() {
  const cssFiles = TARGET_FOLDERS.flatMap((dir) =>
    getCSSFiles(path.join(process.cwd(), dir)),
  );
  let allValid = true;

  // Collect global variables from styles.css and token.css
  let globalDefinedVars = [];
  GLOBAL_CSS_FILES.forEach((file) => {
    const { defined } = processCssFile(file);
    globalDefinedVars = [...new Set([...globalDefinedVars, ...defined])];
  });

  // Process each CSS file
  cssFiles.forEach((file) => {
    const { defined, used } = processCssFile(file);

    // Merge local and global defined variables
    const allDefinedVars = new Set([...globalDefinedVars, ...defined]);

    // Find undefined variables
    const undefinedVars = used.filter((varName) => !allDefinedVars.has(varName));

    if (undefinedVars.length > 0) {
      console.error(`\x1b[31m✖ Undefined CSS Properties in ${file}:\x1b[0m`);
      undefinedVars.forEach((v) => console.error(`  ${v}`));
      allValid = false;
    }
  });

  if (!allValid) {
    console.error('\x1b[31mError: Failed to find all CSS Properties.\x1b[0m');
    process.exit(1);
  } else {
    console.log('\x1b[32mAll CSS variables are defined.\x1b[0m');
  }
}

lint();
