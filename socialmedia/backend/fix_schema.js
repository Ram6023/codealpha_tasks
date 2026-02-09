const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

function addColumn(table, column, type) {
    db.all(`PRAGMA table_info(${table})`, (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        const exists = rows.some(r => r.name === column);
        if (!exists) {
            console.log(`Adding ${column} to ${table}...`);
            db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`, (err) => {
                if (err) console.error(err);
                else console.log(`Added ${column} successfully.`);
            });
        } else {
            console.log(`${column} already exists in ${table}.`);
        }
    });
}

db.serialize(() => {
    // Ensure Users table has all needed columns
    addColumn('users', 'full_name', 'TEXT');
    addColumn('users', 'bio', 'TEXT');
    addColumn('users', 'image_url', 'TEXT');
});
