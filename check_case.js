import fs from 'fs';
import path from 'path';

function scan(dir) {
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) scan(full);
    else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      const c = fs.readFileSync(full, 'utf8');
      const m = [...c.matchAll(/import\s+.*?from\s+['"](.*?)['"]/g)];
      m.forEach(match => {
        const imp = match[1];
        if (imp.startsWith('.')) {
          let resolved = path.resolve(dir, imp);
          let ext = '';
          if (resolved.endsWith('.tsx') || resolved.endsWith('.ts') || resolved.endsWith('.css')) ext = '';
          else if (fs.existsSync(resolved + '.tsx')) ext = '.tsx';
          else if (fs.existsSync(resolved + '.ts')) ext = '.ts';
          else if (fs.existsSync(resolved + '.css')) ext = '.css';
          else if (fs.existsSync(path.join(resolved, 'index.tsx'))) { resolved = path.join(resolved, 'index'); ext = '.tsx'; }
          else if (fs.existsSync(path.join(resolved, 'index.ts'))) { resolved = path.join(resolved, 'index'); ext = '.ts'; }
          
          if (ext !== '') {
            const target = resolved + ext;
            const targetDir = path.dirname(target);
            if (fs.existsSync(targetDir)) {
                const targetFile = path.basename(target);
                const actualFiles = fs.readdirSync(targetDir);
                if (!actualFiles.includes(targetFile)) {
                  console.log('Case mismatch:', full, '->', imp, '(Actual:', actualFiles.find(a => a.toLowerCase() === targetFile.toLowerCase()), ')');
                }
            }
          }
        }
      });
    }
  });
}
scan('./src');
