const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

let issues = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, i) => {
    // Check for standard buttons
    if (line.match(/<Button/)) {
      // Allow if it has an onClick, href, type="submit", asChild, disabled, or if the next couple lines have it.
      // Better heuristic: just check the raw block of the component
      const slice = content.substring(content.indexOf(line), content.indexOf('>', content.indexOf(line)));
      
      if (!slice.includes('onClick') && !slice.includes('type="submit"') && !slice.includes('asChild') && !slice.includes('disabled')) {
        issues.push(`${file}:${i+1} : Missing handler on Button -> ${line.trim()}`);
      }
    }
    
    // Check for DropdownMenuItem
    if (line.match(/<DropdownMenuItem/)) {
      const slice = content.substring(content.indexOf(line), content.indexOf('>', content.indexOf(line)));
      if (!slice.includes('onClick') && !slice.includes('asChild')) {
        issues.push(`${file}:${i+1} : Missing handler on DropdownMenuItem -> ${line.trim()}`);
      }
    }
  });
});

console.log(issues.join('\n'));
