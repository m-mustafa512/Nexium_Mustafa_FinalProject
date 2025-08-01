const fs = require("fs");
const path = require("path");

const PROJECT_DIR = __dirname;
const COMPONENTS_DIR = path.join(PROJECT_DIR, "components/ui");

const allFiles = [];
const componentFiles = [];

// Step 1: Gather all project files
function collectFiles(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      collectFiles(fullPath);
    } else if (/\.(ts|tsx|js|jsx)$/.test(fullPath)) {
      allFiles.push(fullPath);
      if (fullPath.startsWith(COMPONENTS_DIR)) {
        componentFiles.push(fullPath);
      }
    }
  });
}

// Step 2: Check if a component is imported in any file
function isComponentUsed(filePath) {
  const relativePath = path.relative(PROJECT_DIR, filePath).replace(/\.(tsx|ts|js|jsx)$/, "");
  const importPath = relativePath.replace(/\\/g, "/"); // for Windows

  for (const f of allFiles) {
    const content = fs.readFileSync(f, "utf8");

    // Match full or partial path import
    if (
      content.includes(`'@/${importPath}'`) ||
      content.includes(`"./${importPath}"`) ||
      content.includes(`'${importPath}'`) ||
      content.includes(`@/${importPath}`) ||
      content.includes(importPath)
    ) {
      return true;
    }
  }
  return false;
}

// Step 3: Main
collectFiles(PROJECT_DIR);

const unusedComponents = componentFiles.filter((file) => !isComponentUsed(file));

// Show unused components
if (unusedComponents.length === 0) {
  console.log("✅ No unused components found.");
} else {
  console.log("🗑️ Deleting unused components:\n");
  unusedComponents.forEach((file) => {
    console.log("🗑️", path.relative(PROJECT_DIR, file));
    fs.unlinkSync(file); // delete the file
  });
  console.log(`\n✅ Done. Deleted ${unusedComponents.length} file(s).`);
}
