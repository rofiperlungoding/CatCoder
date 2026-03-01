const fs = require('fs');

async function run() {
  const { GithubIcon } = await import('@hugeicons/core-free-icons');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="hugeicon">
  <style>
    path {
      stroke: #000;
    }
    @media (prefers-color-scheme: dark) {
      path {
        stroke: #fff;
      }
    }
  </style>
${GithubIcon.map(([tag, attrs]) => {
    const props = Object.entries(attrs).map(([k, v]) => {
      if (k === 'stroke') return '';
      const name = k.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${name}="${v}"`;
    }).filter(Boolean).join(' ');

    return `<${tag} ${props} />`;
  }).join('\n')}
</svg>`;
  fs.writeFileSync('public/logo.svg', svg);
}

run();
