const fs = require('fs');
let code = fs.readFileSync('lib/api-client-react/src/generated/api.ts', 'utf8');

code = code.replace(/export type (\w+)Response(?:20\d|200) = \{\s*data: ([^;]+);?\s*status: 20\d;?\s*\}/g, (match, name, inner) => {
    return match + '\nexport type ' + name + 'ResponseData = ' + inner.trim() + ';';
});

code = code.replace(/export type (\w+)ResponseSuccess = \(\1Response(?:20\d|200)\) & \{\s*headers: Headers;\s*\};/g, 'export type $1ResponseSuccess = $1ResponseData;');

// Also handle the case where it might just be directly exported without 200?
// The above regex handles standard Orval wrapped responses.

fs.writeFileSync('lib/api-client-react/src/generated/api.ts', code);
console.log('Patched api.ts types successfully!');
