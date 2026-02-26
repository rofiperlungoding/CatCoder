const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

let filesChanged = 0;

walk(srcDir, function (filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Consolidate @hugeicons/core-free-icons imports
    let hugeIconMatches = [...content.matchAll(/import\s+{([^}]+)}\s+from\s+['"]@hugeicons\/core-free-icons['"];?/g)];
    if (hugeIconMatches.length > 1) {
      let iconNames = new Set();
      hugeIconMatches.forEach(m => {
        m[1].split(',').forEach(i => iconNames.add(i.trim()));
      });
      // Remove all hugeicons imports
      content = content.replace(/import\s+{[^}]+}\s+from\s+['"]@hugeicons\/core-free-icons['"];?[\r\n]*/g, '');
      // Add the consolidated one
      let consolidated = `import { ${Array.from(iconNames).filter(Boolean).join(', ')} } from '@hugeicons/core-free-icons';\n`;
      content = consolidated + content;
    }

    // Deduplicate `import { Icon } from ...`
    let lines = content.split('\n');
    let seenIconImportRegex = /import\s+{\s*Icon\s*}\s+from\s+['"]([^'"]+)['"]/;
    let firstIconLine = -1;
    let newLines = [];

    for (let i = 0; i < lines.length; i++) {
      let m = lines[i].match(seenIconImportRegex);
      if (m) {
        if (firstIconLine === -1) {
          firstIconLine = i;
          newLines.push(lines[i]);
        }
        // else skip
      } else {
        newLines.push(lines[i]);
      }
    }
    content = newLines.join('\n');

    // Make sure we also change GitHubIcon to GithubIcon everywhere
    content = content.replace(/import\s+{([^}]*)\bGitHubIcon\b([^}]*)}\s+from\s+['"]@hugeicons\/core-free-icons['"]/g, "import {$1GithubIcon$2} from '@hugeicons/core-free-icons'");
    content = content.replace(/<Icon icon={GitHubIcon}/g, "<Icon icon={GithubIcon}");

    // Replace MapIcon with MapsIcon
    content = content.replace(/import\s+{([^}]*)\bMapIcon\b([^}]*)}\s+from\s+['"]@hugeicons\/core-free-icons['"]/g, "import {$1MapsIcon$2} from '@hugeicons/core-free-icons'");
    content = content.replace(/<Icon icon={MapIcon}/g, "<Icon icon={MapsIcon}");

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesChanged++;
      console.log(`Deduped ${filePath}`);
    }
  }
});

console.log(`Processed ${filesChanged} files!`);
