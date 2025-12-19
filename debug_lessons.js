
const fs = require('fs');
const path = require('path');

// Mock types to avoid import errors
const loadFile = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    // Extract the array using regex or simple parsing
    // This is a rough parser for the exported array
    const match = content.match(/export const \w+Lessons: Lesson\[\] = (\[[\s\S]*?\]);/);
    if (match) {
        // We need to make the content valid JSON-ish to parse it, or evaluating it
        // Evaluating is risky but easiest for this structure
        // We'll simplisticly regex for keys
        const lessons = [];
        const idMatches = content.matchAll(/id:\s*['"](.+?)['"]/g);
        const titleMatches = content.matchAll(/title:\s*['"](.+?)['"]/g);
        const langMatches = content.matchAll(/language:\s*['"](.+?)['"]/g);

        const ids = [...idMatches].map(m => m[1]);
        const titles = [...titleMatches].map(m => m[1]);
        const langs = [...langMatches].map(m => m[1]);

        return { ids, titles, langs, count: ids.length };
    }
    return { error: "Could not parse" };
};

const python = loadFile('src/data/lessons/python.ts');
const js = loadFile('src/data/lessons/javascript.ts');
const cpp = loadFile('src/data/lessons/cpp.ts');

console.log('Python Check:', python.count, 'lessons');
console.log('Sample IDs:', python.ids.slice(0, 3));
console.log('Languages found:', [...new Set(python.langs)]);
console.log('---');
console.log('JS Check:', js.count, 'lessons');
console.log('Languages found:', [...new Set(js.langs)]);
console.log('---');
console.log('CPP Check:', cpp.count, 'lessons');
console.log('Languages found:', [...new Set(cpp.langs)]);
