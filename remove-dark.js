const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let originalContent = content;
            
            // Remove dark: classes
            content = content.replace(/\bdark:[^\s"'`]+/g, '');
            // Clean up double spaces within class strings (heuristic)
            content = content.replace(/(className\s*=\s*["'`].*?)(\s{2,})(.*?["'`])/g, '$1 $3');
            
            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated ${filePath}`);
            }
        }
    }
}

processDirectory('./src');
