'use strict';
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const HTML_DIRS = [
  { html: 'html/pages', templates: 'js/templates/pages', suffix: '-template.js' },
  { html: 'html/components', templates: 'js/templates/components', suffix: '-template.js' }
];

let failed = 0;

HTML_DIRS.forEach(function checkDir({ html: htmlDir, templates: tplDir, suffix }) {
  const htmlPath = path.join(ROOT, htmlDir);

  if (!fs.existsSync(htmlPath)) {
    return;
  }

  fs.readdirSync(htmlPath).forEach(function checkFile(htmlFile) {
    if (!htmlFile.endsWith('.html')) {
      return;
    }

    const baseName = path.basename(htmlFile, '.html');
    const tplFile = path.join(ROOT, tplDir, baseName + suffix);

    if (!fs.existsSync(tplFile)) {
      console.error('MISSING template for ' + path.join(htmlDir, htmlFile) + ' (expected ' + path.join(tplDir, baseName + suffix) + ')');
      failed += 1;
      return;
    }

    const htmlContent = fs.readFileSync(path.join(ROOT, htmlDir, htmlFile), 'utf8').trim();

    // Execute the template IIFE to capture the registered HTML
    const registered = {};
    const windowObj = {
      TermosHtmlLoader: {
        registerTemplate: function (registeredPath, html) {
          registered[registeredPath] = html;
        }
      }
    };

    // eslint-disable-next-line no-new-func
    new Function('window', fs.readFileSync(tplFile, 'utf8'))(windowObj);

    const expectedPath = htmlDir + '/' + htmlFile;
    const tplContent = registered[expectedPath];

    if (tplContent === undefined) {
      console.error('NO REGISTRATION found in ' + path.join(tplDir, baseName + suffix) + ' for path "' + expectedPath + '"');
      failed += 1;
      return;
    }

    if (tplContent.trim() !== htmlContent) {
      console.error('MISMATCH: ' + path.join(htmlDir, htmlFile) + ' differs from ' + path.join(tplDir, baseName + suffix));
      failed += 1;
    } else {
      console.log('OK: ' + path.join(htmlDir, htmlFile));
    }
  });
});

if (failed > 0) {
  console.error('\n' + failed + ' template(s) out of sync.');
  process.exit(1);
} else {
  console.log('\nAll templates are in sync.');
}
