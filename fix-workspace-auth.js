const fs = require('fs');
const file = 'src/app/workspace/page.tsx';
let c = fs.readFileSync(file, 'utf8');

const oldReturn = "    return (\r\n      <main className=\"pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]\">";

const newReturn = "    if (authLoading) return (\r\n      <main className=\"pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]\">\r\n        <div className=\"max-w-7xl mx-auto px-6 py-20 text-center\">\r\n          <div className=\"text-white text-xl\">Loading...</div>\r\n        </div>\r\n      </main>\r\n    );\r\n\r\n    return (\r\n      <main className=\"pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]\">";

if (c.includes(oldReturn)) {
  c = c.replace(oldReturn, newReturn);
  fs.writeFileSync(file, c, 'utf8');
  console.log('SUCCESS');
} else {
  console.log('MATCH FAILED');
}
