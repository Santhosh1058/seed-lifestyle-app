console.log('Verifying application structure...');
const fs = require('fs');

const requiredFiles = [
    'src/components/Layout.jsx',
    'src/pages/Dashboard.jsx',
    'src/pages/StockEntry.jsx',
    'src/pages/Sales.jsx',
    'src/pages/Expenses.jsx',
    'src/App.jsx',
    'server/index.js',
    'server/db.js',
    'server/routes/stock.js',
    'server/routes/sales.js',
    'server/routes/expenses.js'
];

let missing = [];
requiredFiles.forEach(f => {
    if (!fs.existsSync(f)) missing.push(f);
});

if (missing.length > 0) {
    console.error('Missing files:', missing);
    process.exit(1);
} else {
    console.log('All core files present.');
}
