// 粗查 TS 文件括号配平（剥离字符串与注释后核对 {} () []）
const fs = require('fs');
const files = process.argv.slice(2);
let fail = false;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  let out = '';
  let i = 0, mode = '';
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (mode === '') {
      if (c === '/' && n === '/') { mode = 'line'; i += 2; continue; }
      if (c === '/' && n === '*') { mode = 'block'; i += 2; continue; }
      if (c === '"' || c === "'" || c === '`') { mode = c; i++; continue; }
      out += c; i++; continue;
    }
    if (mode === 'line' && c === '\n') { mode = ''; out += c; }
    else if (mode === 'block' && c === '*' && n === '/') { mode = ''; i += 2; continue; }
    else if (mode && c === '\\') { i += 2; continue; }
    else if (mode && c === mode) { mode = ''; }
    i++;
  }
  const count = (ch) => [...out].filter(x => x === ch).length;
  const pairs = [['{', '}'], ['(', ')'], ['[', ']']];
  const bad = pairs.filter(([a, b]) => count(a) !== count(b));
  if (bad.length) { fail = true; console.log('FAIL', f, bad.map(([a, b]) => `${a}${count(a)}/${b}${count(b)}`).join(' ')); }
  else console.log('OK  ', f);
}
process.exit(fail ? 1 : 0);
