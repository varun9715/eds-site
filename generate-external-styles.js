/* eslint-disable */
const fs = require('fs');
const path = require('path');

// --- Configuration ---

/**
 * The unique scope for the component, defined using the modern :is() pseudo-class.
 * All CSS rules will be rewritten to only apply to elements inside this scope.
 * It finds an element that is either a <header> or <footer> AND also has the
 * .eds-block class. This is chosen because the component's loader script uses
 * `doc.querySelector('header.eds-block')` to find and initialize the component.
 * This ensures the styles and scripts target the exact same elements.
 */
const IS_SCOPE = ':is(header, footer).eds-block';
const IS_SKIP = '.skip-to-main';

// --- DEFINE EXCLUSION ---
// This stops our component styles from affecting nested widgets.
// By wrapping the exclusion logic in `:where()`, the entire `:not()`
// pseudo-class adds (0,0,0) to the specificity.
const WIDGET_EXCLUSION = ':not(:where([class*="widget"].block *))';

// --- Helper Functions ---

/**
 * Transforms a single CSS selector string into its modern, scoped version using :is().
 * If the selector targets a global element (html, body, main), it returns null to indicate
 * that the rule should be ignored.
 * @param {string} selector - The original CSS selector (e.g., 'body', '.button', '*').
 * @returns {string|null} The new, safely scoped selector, or null if it should be ignored.
 */
function getScopedSelector(selector) {
  const trimmedSelector = selector.trim();

  // --- IGNORE RULE ---
  // Selectors targeting the page's global layout elements (html, body, main) should be skipped
  // to avoid interfering with the host page styles. We check the first token of a selector.
  // Ex: 'html' in 'html[lang]', 'body' in 'body.noscroll' or 'main' in 'main > .section'
  const firstToken = trimmedSelector.split(/[\s>~+]+/)[0];

  if (
    firstToken === 'html' ||
    firstToken.startsWith('html[') ||
    firstToken.startsWith('html.') ||
    firstToken === 'body' ||
    firstToken.startsWith('body[') ||
    firstToken.startsWith('body.') ||
    firstToken === 'main'
  ) {
    return null; // Return null to signify this selector should be ignored.
  }

  // RULE 1: Handle `:root` for CSS Variables
  // CSS variables defined in :root should be applied to the component's scope.
  // Ex: ':root { --some-var: red; }' becomes ':is(header, footer).eds-block { --some-var: red; }'
  if (trimmedSelector === ':root') {
    // return IS_SCOPE;
    return `${IS_SKIP}, ${IS_SCOPE}`;
  }

  // RULE 2: Handle the Universal Selector (*)
  // The universal selector should apply to ALL elements *within* the scope,
  // but not to elements inside a nested widget container.
  // Ex: '* { box-sizing: border-box; }' becomes
  //     ':is(...) *:not(:where([class*="widget"].block *)) { ... }'
  if (trimmedSelector === '*') {
    return `${IS_SCOPE} *${WIDGET_EXCLUSION}`;
  }

  // RULE 3: Descendant Selectors with Redundant `header` or `footer`
  // Strips a leading 'header ' or 'footer ' since the scope already includes them.
  // This prevents redundant selectors like ':is(...) header .class'
  // Ex: 'header .some-class' becomes ':is(...) .some-class:not(:where(...))'
  let finalSelector = trimmedSelector;

  if (finalSelector.startsWith('header ')) {
    // Replaces the first occurrence of 'header ' with an empty string.
    finalSelector = finalSelector.replace('header ', '');
  } else if (finalSelector.startsWith('footer ')) {
    // Does the same for the 'footer ' prefix.
    finalSelector = finalSelector.replace('footer ', '');
  }

  // RULE 4: Inject the exclusion into the selector
  // To correctly handle pseudo-elements (e.g., ::before), we must inject the exclusion
  // before them. A selector like '.foo::before' must become '.foo:not(:where(...))::before'.
  const pseudoElementMatch = finalSelector.match(/(::[\w-]+(\(.+\))?)$/);
  let baseSelector = finalSelector;
  let pseudoElementSuffix = '';

  if (pseudoElementMatch) {
    // Separate the base selector from the pseudo-element at the end
    baseSelector = finalSelector.substring(0, pseudoElementMatch.index);
    pseudoElementSuffix = pseudoElementMatch[0];
  }

  // Append the exclusion to the main part of the selector
  const protectedBaseSelector = `${baseSelector.trim()}${WIDGET_EXCLUSION}`;

  // Re-attach the pseudo-element suffix to form the final, protected selector
  const protectedFinalSelector = `${protectedBaseSelector}${pseudoElementSuffix}`;

  // DEFAULT RULE: Prepend scope and add exclusion to all other selectors
  // Ex: '.button' becomes ':is(...) .button:not(:where([class*="widget"].block *))'
  return `${IS_SKIP} ${baseSelector.trim()}${pseudoElementSuffix}, ${IS_SCOPE} ${protectedFinalSelector}`;
}

/**
 * Processes a block of rules, applying the scoping logic to each rule.
 * @param {string} rulesString The string of CSS rules to process.
 * @returns {string} The processed string of scoped CSS rules.
 */
function processRuleBlock(rulesString) {
  const processedRules = [];

  // This regex finds every CSS rule block.
  // - Group 1 ([^@}{]+?): Lazily captures the selector part. It matches any character
  //   except '@', '{', or '}' to avoid grabbing media rules or nested content.
  // - Group 2 (\{([\s\S]*?)\}): Captures the CSS properties inside the curly braces.
  rulesString.replace(/([^@}{]+?)\s*\{([\s\S]*?)\}/g, (match, selectors, cssBody) => {
    // A rule can have multiple selectors separated by commas (e.g., 'h1, h2, h3').
    // We split them, transform each one individually, and then join them back.
    const newSelectors = selectors
      .split(',')
      .map((s) => getScopedSelector(s)) // Transform each selector; ignored ones become null.
      .filter((s) => s) // Filter out the null/empty (falsy) values.
      .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates that might result from transformation.
      .join(',\n'); // Join the valid, unique selectors back together with newline for readability.

    // If, after filtering, there are any selectors left, reconstruct the CSS rule.
    if (newSelectors.trim()) {
      processedRules.push(`${newSelectors} {${cssBody}}`);
    }
  });

  return processedRules.join('\n');
}

/**
 * Main execution function for the script.
 * @param {string[]} argv - Array of command-line arguments.
 */
function run(argv, fsModule = fs) {
  // --- CLI arguments ---
  // The script is run from the command line, e.g.:
  // node generate-external-styles.js <inputFile> <outputFile> [appendOverrides]
  const args = argv;

  if (args.length < 2) {
    console.error(
      'Usage: node generate-external-styles.js <inputFile> <outputFile> [appendOverrides]',
    );
    process.exit(1);
  }

  const inputFile = path.resolve(args[0]);
  const outputFile = path.resolve(args[1]);
  const appendOverrides = args[2] === 'true';

  // --- Main Logic ---

  let css = fsModule.readFileSync(inputFile, 'utf-8');

  // 1. Remove all CSS comments (/* ... */) to simplify subsequent regex processing.
  // The [\s\S]*? part is a non-greedy way to match any character, including newlines.
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');

  // 2. Initialize containers for different parts of the CSS.
  const importStatements = [];
  const mediaQueries = [];
  const baseRules = [];

  // 3. State machine for parsing the CSS file line-by-line.
  let inMediaBlock = false;
  let braceDepth = 0;
  let currentMediaBlock = '';

  for (const line of css.split('\n')) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('@import')) {
      // Special handling for normalize.css to point to its external version.
      if (line.includes('normalize.css')) {
        importStatements.push(`@import url('./external-normalize.css');`);
      } else {
        importStatements.push(line.trim());
      }
      continue;
    }

    if (trimmedLine.includes('@media') && !inMediaBlock) {
      inMediaBlock = true;
    }

    if (inMediaBlock) {
      // Add the current line to the string that holds the full media query block.
      currentMediaBlock += line + '\n';

      // Count the opening and closing curly braces to track our depth inside the block.
      // This correctly handles media queries that contain multiple nested rules.
      // The '|| []' prevents an error if a line has no braces.
      braceDepth += (line.match(/{/g) || []).length;
      braceDepth -= (line.match(/}/g) || []).length;

      // If braceDepth returns to 0, it means we have found the final closing brace
      // for the @media rule, so the block is complete.
      if (braceDepth === 0 && currentMediaBlock.trim() !== '') {
        // Add the complete media query block to our array.
        mediaQueries.push(currentMediaBlock);

        // Reset the state machine for the next lines.
        currentMediaBlock = '';
        inMediaBlock = false;
      }
    } else if (trimmedLine !== '') {
      // If we are NOT inside a media query and the line isn't empty,
      // it must be a base style rule. Add it to the base rules array.
      baseRules.push(line);
    }
  }

  // 4. Process the base rules first to define scopedBaseCss.
  const scopedBaseCss = processRuleBlock(baseRules.join('\n'));

  // 5. Process the media query rules.
  const scopedMediaQueries = mediaQueries.map((mq) => {
    // Use a regular expression to safely split the media query block into two parts:
    // 1. The opening declaration (e.g., '@media (width >= 64rem) {')
    // 2. The inner CSS rules contained within the block.
    const mqMatch = mq.match(/(@media[\s\S]*?\{)([\s\S]*)\s*\}\s*$/);

    // If the regex successfully matches, proceed with the transformation.
    if (mqMatch) {
      // Destructure the match array to get our two captured groups.
      // mqRule will be the opening part, and innerCss will be the content.
      const [, mqRule, innerCss] = mqMatch;

      // Send ONLY the inner CSS rules to our main processing function.
      // This will apply the same scoping logic as it did for the base styles.
      const scopedInnerCss = processRuleBlock(innerCss);

      // Reconstruct the full media query block with the original declaration
      // and the newly scoped content.
      return `${mqRule}\n${scopedInnerCss}\n}`;
    }

    // As a safety fallback, if the regex fails to match for any reason,
    // return the original, unmodified media query to prevent an error.
    return mq;
  });

  // 6. Final Assembly
  const finalCss = [
    '/* stylelint-disable no-duplicate-selectors */',
    '',
    // Add override import if the CLI flag was set.
    ...(appendOverrides ? [`@import url('./external-overrides.css');`] : []),
    // Add back the original @import statements at the top.
    ...importStatements,
    '',
    // Add the main, scoped base styles.
    scopedBaseCss.trim(),
    '',
    // Add back the fully-scoped media queries at the end.
    ...scopedMediaQueries,
    '',
  ].join('\n');

  // 7. Write the final, processed string to the specified output file.
  fsModule.writeFileSync(outputFile, finalCss, 'utf-8');
  console.log(`Scoped CSS generated at ${outputFile}`);
}

// This block ensures the script runs when called from the command line,
// but does not run when imported into another file (like a test).
if (require.main === module) {
  run(process.argv.slice(2));
}

// Export functions and constants for testing.
module.exports = {
  run,
  getScopedSelector,
  processRuleBlock,
  IS_SCOPE,
  IS_SKIP,
  WIDGET_EXCLUSION,
};
