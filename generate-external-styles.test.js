import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { vol } from 'memfs';

const {
  getScopedSelector,
  processRuleBlock,
  IS_SCOPE,
  IS_SKIP,
  WIDGET_EXCLUSION,
} = require('./generate-external-styles.js');

// This mock tells Vitest to use the in-memory file system for all 'fs' calls.
vi.mock('fs', async () => {
  const memfs = await vi.importActual('memfs');

  return {
    ...memfs.fs,
    default: memfs.fs,
  };
});

describe('CSS Scoping Script', () => {
  // --- Unit Tests for getScopedSelector ---
  describe('getScopedSelector()', () => {
    // --- IGNORE RULE ---
    test('should return null for ignored global selectors (html, body, main)', () => {
      expect(getScopedSelector('html')).toBe(null);
      expect(getScopedSelector('body')).toBe(null);
      expect(getScopedSelector('main')).toBe(null);
      expect(getScopedSelector('body.noscroll')).toBe(null);
      expect(getScopedSelector('html[lang="en"]')).toBe(null);
      expect(getScopedSelector('main > .section')).toBe(null);
    });

    // RULE 1: Handle `:root` for CSS Variables
    test('should transform :root into the component scope without exclusion', () => {
      expect(getScopedSelector(':root')).toBe(`${IS_SKIP}, ${IS_SCOPE}`);
    });

    // RULE 2: Handle the Universal Selector (*)
    test('should handle the universal selector with exclusion', () => {
      expect(getScopedSelector('*')).toBe(`${IS_SCOPE} *${WIDGET_EXCLUSION}`);
    });

    // RULE 3: Descendant Selectors with Redundant `header` or `footer`
    test('should strip root references and add exclusion to descendant selectors', () => {
      expect(getScopedSelector('header .logo')).toBe(
        `${IS_SKIP} .logo, ${IS_SCOPE} .logo${WIDGET_EXCLUSION}`,
      );
      expect(getScopedSelector('footer .nav-link')).toBe(
        `${IS_SKIP} .nav-link, ${IS_SCOPE} .nav-link${WIDGET_EXCLUSION}`,
      );
    });

    // RULE 4: Inject the exclusion into the selector before pseudo-elements
    test('should correctly handle selectors with pseudo-elements', () => {
      const expected = `${IS_SKIP} .button::before, ${IS_SCOPE} .button${WIDGET_EXCLUSION}::before`;
      expect(getScopedSelector('.button::before')).toBe(expected);
      expect(getScopedSelector('a:hover::after')).toBe(
        `${IS_SKIP} a:hover::after, ${IS_SCOPE} a:hover${WIDGET_EXCLUSION}::after`,
      );
    });

    // DEFAULT RULE: Prepend scope and add exclusion to all other selectors
    test('should handle standard descendant selectors with exclusion', () => {
      expect(getScopedSelector('.button')).toBe(
        `${IS_SKIP} .button, ${IS_SCOPE} .button${WIDGET_EXCLUSION}`,
      );
      expect(getScopedSelector('a:hover')).toBe(
        `${IS_SKIP} a:hover, ${IS_SCOPE} a:hover${WIDGET_EXCLUSION}`,
      );
    });
  });

  // --- Unit Tests for processRuleBlock ---
  describe('processRuleBlock()', () => {
    test('should process a simple rule and add exclusion', () => {
      const input = '.btn { color: blue; }';
      const expected = `${IS_SKIP} .btn, ${IS_SCOPE} .btn${WIDGET_EXCLUSION} { color: blue; }`;
      expect(processRuleBlock(input)).toBe(expected);
    });

    test('should handle multi-selector rules and add exclusion', () => {
      const input = 'h1, h2 { font-weight: bold; }';
      const expected = `${IS_SKIP} h1, ${IS_SCOPE} h1${WIDGET_EXCLUSION},\n${IS_SKIP} h2, ${IS_SCOPE} h2${WIDGET_EXCLUSION} { font-weight: bold; }`;
      expect(processRuleBlock(input)).toBe(expected);
    });

    test('should ignore rules where all selectors are global', () => {
      const input = 'body, html, main > div { margin: 0; }';
      expect(processRuleBlock(input)).toBe('');
    });

    test('should preserve valid selectors in a mixed rule and add exclusion', () => {
      const input = 'body, .card, main { border: 1px solid black; }';
      const expected = `${IS_SKIP} .card, ${IS_SCOPE} .card${WIDGET_EXCLUSION} { border: 1px solid black; }`;
      expect(processRuleBlock(input)).toBe(expected);
    });
  });

  // --- Integration Tests for the main run() function ---
  describe('run()', () => {
    // This will hold the "safe" version of the run function, loaded after mocks.
    let run;

    // Spy on console.error and process.exit to test error conditions
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // We mock process.exit to throw an error, which stops the test execution path,
    // preventing the script from trying to access files that don't exist.
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit() was called');
    });

    beforeEach(async () => {
      // Ensures mocks are applied correctly by clearing the module cache before
      // each test in this block.
      vi.resetModules();

      // Dynamically import the script here to get a fresh `run` function.
      // This is the ONLY way to get a `run` function that sees the mocked 'fs'.
      const script = await import('./generate-external-styles.js');

      run = script.run;
      // Reset the virtual file system and spies for a clean test.
      vol.reset();
      // Also reset spies.
      vi.clearAllMocks();
    });

    afterEach(() => {
      // Restore the original console and process functions after the tests in this block.
      errorSpy.mockRestore();
      exitSpy.mockRestore();
    });

    test('should log an error and exit if not enough arguments are provided', () => {
      // We pass `fs` even though it's not used, to match the function signature.
      // We expect the run function to throw the error we defined in our mock.
      // This confirms that process.exit(1) was called.
      expect(() => run([], fs)).toThrow('process.exit() was called');
      expect(errorSpy).toHaveBeenCalledWith(
        'Usage: node generate-external-styles.js <inputFile> <outputFile> [appendOverrides]',
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    test('should include overrides file when appendOverrides flag is true', () => {
      const inputCss = '.card { color: red; }';
      // Create a virtual input file.
      vol.fromJSON({
        [path.resolve('input.css')]: inputCss,
      });

      // Run with the 'appendOverrides' argument set to 'true'.
      run(['input.css', 'output.css', 'true'], fs);

      const actualOutputCss = fs.readFileSync(path.resolve('output.css'), 'utf-8');
      expect(actualOutputCss).toContain("@import url('./external-overrides.css');");
    });

    test('should handle the special case for normalize.css imports', () => {
      const inputCss = "@import url('./normalize.css');";
      vol.fromJSON({ [path.resolve('input.css')]: inputCss });

      run(['input.css', 'output.css'], fs);
      const actualOutputCss = fs.readFileSync(path.resolve('output.css'), 'utf-8');

      // Check that the special-cased URL is present
      expect(actualOutputCss).toContain("@import url('./external-normalize.css');");
      // Check that the original URL is NOT present
      expect(actualOutputCss).not.toContain("@import url('./normalize.css');");
    });

    test('should process a simple CSS file correctly', () => {
      const inputCss = `
        /* A comment that will be removed by the script */
        @import url('./tokens.css');

        main { display: block; } /* This rule should be ignored */
        .card { padding: 1rem; }
      `;
      const expectedOutputCss = [
        '/* stylelint-disable no-duplicate-selectors */',
        '', // From the blank line after the initial stylelint comment.
        "@import url('./tokens.css');",
        '', // From the blank line after the importStatements section.
        `${IS_SKIP} .card, ${IS_SCOPE} .card${WIDGET_EXCLUSION} { padding: 1rem; }`,
        '', // From the blank line before the (empty) media query section.
        '', // From the final trailing newline at the end of the assembly.
      ].join('\n');

      // Create a virtual input file in the in-memory file system.
      vol.fromJSON({
        [path.resolve('input.css')]: inputCss,
      });

      // Call the run function with the paths to our virtual files.
      run(['input.css', 'output.css'], fs);

      // Read the virtual output file that the script created.
      const actualOutputCss = fs.readFileSync(path.resolve('output.css'), 'utf-8');

      expect(actualOutputCss).toBe(expectedOutputCss);
    });

    test('should handle media queries correctly', () => {
      const inputCss = `
        h1 { font-size: 2rem; }
        @media (min-width: 600px) {
            h1 { font-size: 3rem; }
            body { line-height: 1.5; } /* This rule should be ignored */
        }
        `;
      const expectedOutputCss = [
        '/* stylelint-disable no-duplicate-selectors */',
        '', // From the blank line after the initial stylelint comment.
        '', // From the blank line after the (empty) override and import sections.
        `${IS_SKIP} h1, ${IS_SCOPE} h1${WIDGET_EXCLUSION} { font-size: 2rem; }`,
        '', // From the blank line before the media query section.
        `@media (min-width: 600px) {\n${IS_SKIP} h1, ${IS_SCOPE} h1${WIDGET_EXCLUSION} { font-size: 3rem; }\n}`,
        '', // From the final trailing newline at the end of the assembly.
      ].join('\n');

      // Create the virtual input file.
      vol.fromJSON({
        [path.resolve('input.css')]: inputCss,
      });

      // Call the run function with the paths to our virtual files.
      run(['input.css', 'output.css'], fs);

      // Read the virtual output file.
      const actualOutputCss = fs.readFileSync(path.resolve('output.css'), 'utf-8');

      expect(actualOutputCss).toBe(expectedOutputCss);
    });

    test('should return a media query block unmodified if its structure is invalid', () => {
      // This @media rule is invalid because it lacks an opening brace.
      // This triggers the safety fallback in the script.
      const inputCss = '@media all and (min-width: 800px);';
      vol.fromJSON({ [path.resolve('input.css')]: inputCss });

      run(['input.css', 'output.css'], fs);
      const actualOutputCss = fs.readFileSync(path.resolve('output.css'), 'utf-8');

      // The script should fall back to including the original, unmodified string.
      expect(actualOutputCss).toContain(inputCss);
    });

    test('should discard a malformed or unterminated media query', () => {
      // This media query is intentionally broken (it is never closed).
      const inputCss = '@media screen and (min-width: 900px) { .test { color: red; }';

      // The script correctly discards the unterminated media query.
      // The output should be only the boilerplate added during final assembly.
      const expectedOutputCss = [
        '/* stylelint-disable no-duplicate-selectors */',
        '', // Blank line after the initial comment
        '', // Blank line from the empty override section
        '', // Blank line from the empty import section
        '', // Blank line from the empty base CSS section
        '', // The final trailing newline
      ].join('\n');

      // Create the virtual input file.
      vol.fromJSON({
        [path.resolve('input.css')]: inputCss,
      });

      // Call the run function with the paths to our virtual files.
      run(['input.css', 'output.css'], fs);

      // Read the virtual output file.
      const actualOutputCss = fs.readFileSync(path.resolve('output.css'), 'utf-8');

      expect(actualOutputCss).toBe(expectedOutputCss);
    });
  });
});
