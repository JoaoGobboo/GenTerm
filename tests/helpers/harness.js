'use strict';
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '../..');

function loadIife(relPath, windowObj) {
  const code = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  // new Function wraps the code so its 'window' references the passed object
  // eslint-disable-next-line no-new-func
  new Function('window', code)(windowObj);
}

module.exports = { loadIife };
