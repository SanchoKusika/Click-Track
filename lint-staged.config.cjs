const path = require('node:path');

const eslintIn = (workspace) => (files) => {
  if (!files.length) return [];
  const rel = files
    .map((f) => path.relative(workspace, f).split(path.sep).join('/'))
    .map((p) => `"${p}"`)
    .join(' ');
  return `npm exec --workspace ${workspace} -- eslint --fix --no-warn-ignored ${rel}`;
};

module.exports = {
  'backend/**/*.ts': eslintIn('backend'),
  'frontend/**/*.{ts,tsx,js,jsx}': [
    eslintIn('frontend'),
    'prettier --ignore-unknown -w',
  ],
  '*.{json,md,css,yml,yaml}': 'prettier --ignore-unknown -w',
};
