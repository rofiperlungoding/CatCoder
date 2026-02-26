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

const lucideToHuge = {
  // Basic UI components
  'ChevronRight': 'ArrowRight01Icon',
  'ChevronLeft': 'ArrowLeft01Icon',
  'ChevronDown': 'ArrowDown01Icon',
  'ChevronUp': 'ArrowUp01Icon',
  'Settings': 'Settings01Icon',
  'User': 'UserIcon',
  'LogOut': 'Logout01Icon',
  'X': 'Cancel01Icon',
  'Menu': 'Menu01Icon',
  'Search': 'Search01Icon',
  'Check': 'CheckmarkBadge01Icon',
  'AlertCircle': 'Alert01Icon',
  'Info': 'InformationCircleIcon',
  'Play': 'PlayIcon',
  'Pause': 'PauseIcon',
  'Code': 'CodeIcon',
  'Terminal': 'Terminal02Icon',
  'Star': 'StarIcon',
  'Moon': 'Moon02Icon',
  'Sun': 'Sun01Icon',
  'Cat': 'GitHubIcon',
  'Trophy': 'Trophy01Icon',
  'Flame': 'FireIcon',
  'Mail': 'Mail01Icon',
  'Send': 'SentIcon',
  'CheckCircle': 'CheckmarkCircle01Icon',
  'ArrowLeft': 'ArrowLeft01Icon',
  'ArrowRight': 'ArrowRight01Icon',
  'Lock': 'LockPasswordIcon',
  'Unlock': 'UnlockIcon',
  'Edit': 'Edit01Icon',
  'Trash': 'Delete01Icon',
  'Home': 'Home01Icon',
  'Book': 'Book01Icon',
  'Award': 'Award01Icon',
  'Save': 'DiskIcon',
  'Download': 'Download01Icon',
  'Upload': 'Upload01Icon',
  'Eye': 'ViewIcon',
  'EyeOff': 'ViewOffIcon',
  'Plus': 'Add01Icon',
  'FileText': 'DocumentTextIcon',
  'Cpu': 'CpuIcon',
  'Battery': 'BatteryFullIcon',
  'Zap': 'EnergyIcon',

  // Missing ones:
  'Code2': 'ProgrammingFlagIcon',
  'BookOpen': 'BookOpen01Icon',
  'Map': 'MapIcon',
  'MapPin': 'Location01Icon',
  'Sparkles': 'SparklesIcon',
  'Activity': 'Activity01Icon',
  'Trash2': 'Delete02Icon',
  'Timer': 'Timer02Icon',
  'ArrowUpRight': 'ArrowUpRight01Icon',
  'Calendar': 'Calendar01Icon',
  'Share2': 'Share01Icon',
  'ExternalLink': 'LinkSquare01Icon',
  'Shield': 'Shield01Icon',
  'Target': 'Target01Icon',
  'CheckCircle2': 'CheckmarkCircle02Icon',
  'Clock': 'Clock01Icon',
  'Lightbulb': 'LightBulbIcon',
  'RotateCw': 'ReloadIcon',
  'Edit2': 'Edit02Icon',
  'Heart': 'FavouriteIcon',
  'Globe': 'Globe01Icon',
  'Users': 'UserGroupIcon',
  'Phone': 'CallIcon',
  'TerminalSquare': 'TerminalIcon',
  'Crown': 'CrownIcon',
  'MessageSquareCode': 'MessageProgrammingIcon',
  'Briefcase': 'Briefcase01Icon',
  'BrainCircuit': 'AiBrainIcon',
  'Brain': 'AiBrainIcon',
  'Server': 'ServerIcon',
  'Loader2': 'Loading02Icon',
  'TrendingUp': 'ArrowUpRight01Icon',
  'RefreshCw': 'ReloadIcon'
};

let filesChanged = 0;

walk(srcDir, function (filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes('lucide-react')) {
      let imports = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
      if (imports) {
        let icons = imports[1].split(',').map(i => i.trim()).filter(Boolean);
        let hugeIconsToImport = new Set();
        let remainingLucide = [];

        icons.forEach(lucideIcon => {
          const cleanName = lucideIcon.split(' as ')[0].trim();
          if (lucideToHuge[cleanName]) {
            let newName = lucideToHuge[cleanName];
            hugeIconsToImport.add(newName);

            let reg = new RegExp('<' + lucideIcon + '([\\s>])', 'g');
            content = content.replace(reg, `<Icon icon={${newName}}$1`);
          } else {
            remainingLucide.push(lucideIcon);
            console.log(`Missing HugeIcon mapping for: ${lucideIcon} in ${filePath}`);
          }
        });

        if (remainingLucide.length === 0) {
          content = content.replace(/import\s+{[^}]+}\s+from\s+['"]lucide-react['"];?[\r\n]*/, '');
        } else {
          let newLucideImport = `import { ${remainingLucide.join(', ')} } from 'lucide-react';\n`;
          content = content.replace(/import\s+{[^}]+}\s+from\s+['"]lucide-react['"];?[\r\n]*/, newLucideImport);
        }

        if (hugeIconsToImport.size > 0) {
          let hugeImport = `import { ${Array.from(hugeIconsToImport).join(', ')} } from '@hugeicons/core-free-icons';\n`;
          if (!content.includes('import {') || !content.match(/import\s+{.*Icon.*}\s+from\s+['"][^'"]*components\/ui['"]/)) {
            if (content.match(/import\s+{([^}]+)}\s+from\s+['"][^'"]*components\/ui['"]/)) {
              content = content.replace(/(import\s+{([^}]+)}\s+from\s+['"][^'"]*components\/ui['"])/, function (match, p1, p2) {
                if (!p2.includes('Icon')) {
                  return match.replace('{', '{ Icon,');
                }
                return match;
              });
            } else {
              let relativePath = path.relative(path.dirname(filePath), path.join(__dirname, 'src', 'components', 'ui'));
              relativePath = relativePath.replace(/\\/g, '/');
              if (!relativePath.startsWith('.')) relativePath = './' + relativePath;
              hugeImport += `import { Icon } from '${relativePath}';\n`;
            }
          }
          content = hugeImport + content;
        }

        fs.writeFileSync(filePath, content, 'utf8');
        filesChanged++;
        console.log(`Updated ${filePath}`);
      }
    }
  }
});

console.log(`Processed ${filesChanged} files!`);
