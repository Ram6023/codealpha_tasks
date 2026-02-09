const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    console.log("--- USERS ---");
    db.all("SELECT id, username, email FROM users", (err, rows) => {
        if (err) console.error(err);
        else console.log(rows);
    });

    console.log("--- POSTS ---");
    db.all("SELECT id, user_id, content FROM posts", (err, rows) => {
        if (err) console.error(err);
        else console.log(rows);
    });
});
