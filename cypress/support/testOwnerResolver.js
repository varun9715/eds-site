const fs = require('fs/promises');
const path = require('path');

class TestOwnersResolver {
  constructor(ownerMap = {}) {
    this.ownerForFile = ownerMap;
  }

  static async createFromFile(filePathFromProjectRoot) {
    try {
      const fullPath = path.resolve(process.cwd(), filePathFromProjectRoot);
      const content = await fs.readFile(fullPath, 'utf8');
      const ownerMap = TestOwnersResolver.#parseTestOwners(content);
      return new TestOwnersResolver(ownerMap);
    } catch (err) {
      console.error(`Error reading TESTOWNERS file: ${err.message}`);
      console.error(`Attempted to read from: ${filePathFromProjectRoot}`);
      return new TestOwnersResolver();
    }
  }

  findOwner(fileName) {
    const owner = this.ownerForFile[fileName] ?? null;
    return owner;
  }

  getOwnerMap() {
    return this.ownerForFile;
  }

  static #parseTestOwners(content) {
    const lines = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));

    const ownerMap = {};

    lines.forEach((line) => {
      const [filePath, ...owners] = line.split(/\s+/);
      if (!filePath || owners.length === 0) {
        return;
      }
      // eslint-disable-next-line prefer-destructuring
      ownerMap[filePath] = owners[0];
    });

    return ownerMap;
  }
}

module.exports = TestOwnersResolver;
