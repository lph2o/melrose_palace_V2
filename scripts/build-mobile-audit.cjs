const fs = require('fs');

// 1. dist
const distHtml = fs.readFileSync('dist/index.html', 'utf8');
const cssName = fs.readdirSync('dist/assets').find(f => f.endsWith('.css'));
const cssFile = fs.readFileSync('dist/assets/' + cssName, 'utf8');
const jsName = distHtml.match(/<script[^>]*src="([^"]+\.js)"/)[1].split('/').pop();
const js = fs.readFileSync('dist/assets/' + jsName, 'utf8');

// 2. Shell inline (CSS + JS module), échappé pour survivre au template
const escapedJs = js.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const appShell = '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>SIC</title><style>' + cssFile + '</style></head><body><div id="root"></div><script type="module">' + escapedJs + '</' + 'script></body></html>';

// 3. Page d'audit + template avec le shell — FONCTION de remplacement pour éviter la substitution $&
let audit = fs.readFileSync('public/mobile-audit.html', 'utf8');
const shellEscaped = appShell.replace(/<\/template/gi, () => '<\\/template');
audit = audit.replace('</body>', () => '<template id="app-shell">' + shellEscaped + '</template>\n</body>');
fs.writeFileSync('public/mobile-audit-standalone.html', audit);

// 4. Vérif : extraire le script inline du shell et vérifier la syntaxe
const s = audit.indexOf('<script type="module">');
const e = audit.indexOf('</' + 'script>', s);
const code = audit.slice(s + 22, e);
fs.writeFileSync('/tmp/blob-script.js', code);
console.log('script bytes:', code.length, '| contains </body>:', code.includes('</body>'), '| contains </template:', code.includes('</template'));
