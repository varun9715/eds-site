const fs = require('fs');
const path = require('path');

// Source and destination directories
const sourceDir = path.join(__dirname, 'node_modules/@runway-core/assets-svg');
const iconsDir = path.join(__dirname, 'icons');
const jsonOutputFile = path.join(iconsDir, 'assets.json'); // Now creating assets.json inside the icons folder

// Ensure the icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Object to hold the mapping of files
const iconMap = {};

// Function to copy SVG files recursively from a directory and build the map
function copySvgFilesRecursive(srcDir, currentPath = []) {
  const files = fs.readdirSync(srcDir);

  files.forEach((file) => {
    const fullPath = path.join(srcDir, file);
    const stat = fs.statSync(fullPath);
    const destPath = path.join(iconsDir, file);

    // If it's a directory, recurse into it
    if (stat.isDirectory()) {
      // Recurse into the directory and pass the new currentPath
      copySvgFilesRecursive(fullPath, [...currentPath, file]);
    } else if (file.endsWith('.svg')) {
      // Copy the SVG file to the icons folder
      fs.copyFileSync(fullPath, destPath);

      // Construct the nested path for the JSON structure
      const fileName = path.basename(file, '.svg');
      let currentMap = iconMap;

      // Navigate through the currentPath array to build the nested structure
      currentPath.forEach((part) => {
        // If the part doesn't exist in the map, create it
        if (!currentMap[part]) {
          currentMap[part] = {};
        }
        currentMap = currentMap[part]; // Move deeper into the nested structure
      });

      // Assign the final file path in the nested structure
      currentMap[fileName] = `icons/${file}`;

      console.log(`Copied ${file} to ./icons`);
    }
  });
}

// Start the copying and mapping process
copySvgFilesRecursive(sourceDir);

// Write the JSON output to a file inside the icons folder
fs.writeFileSync(jsonOutputFile, JSON.stringify(iconMap, null, 2));

console.log(
  'SVG files have been copied and the assets.json map has been generated inside the ./icons folder.',
);
