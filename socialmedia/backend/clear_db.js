const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    console.log("Clearing all data from tables...");
    db.run("DELETE FROM messages");
    db.run("DELETE FROM notifications");
    db.run("DELETE FROM likes");
    db.run("DELETE FROM comments");
    db.run("DELETE FROM posts");
    db.run("DELETE FROM followers");
    db.run("DELETE FROM users");
    db.run("DELETE FROM sqlite_sequence"); // Reset auto-increment counters
    console.log("All data cleared. Database is fresh.");
});

db.close();
