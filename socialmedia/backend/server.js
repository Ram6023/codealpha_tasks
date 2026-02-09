const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key_123';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public')));

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error('Database connection error:', err);
    else console.log('Connected to SQLite database');
});

// Database Migrations & Schema Initialization
db.serialize(() => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        full_name TEXT,
        bio TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Posts Table
    db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT,
        image_url TEXT,
        location TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Comments Table
    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        user_id INTEGER,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(post_id) REFERENCES posts(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Likes Table
    db.run(`CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(post_id) REFERENCES posts(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Followers Table
    db.run(`CREATE TABLE IF NOT EXISTS followers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        follower_id INTEGER,
        following_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(follower_id) REFERENCES users(id),
        FOREIGN KEY(following_id) REFERENCES users(id)
    )`);

    // Messages Table (NEW)
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER,
        receiver_id INTEGER,
        content TEXT,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(sender_id) REFERENCES users(id),
        FOREIGN KEY(receiver_id) REFERENCES users(id)
    )`);

    // Notifications Table (NEW)
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER, 
        actor_id INTEGER,
        type TEXT,
        entity_id INTEGER,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(actor_id) REFERENCES users(id)
    )`);
});

// Middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Helper to create notification
const createNotification = (userId, actorId, type, entityId) => {
    if (userId === actorId) return; // Don't notify self
    db.run("INSERT INTO notifications (user_id, actor_id, type, entity_id) VALUES (?, ?, ?, ?)",
        [userId, actorId, type, entityId],
        (err) => { if (err) console.error('Notification error:', err); }
    );
};

// --- Routes ---

// Auth
app.post('/api/auth/register', (req, res) => {
    const { email, username, password, fullName } = req.body;
    if (!email || !username || !password) return res.status(400).json({ message: 'Missing fields' });

    const hashedPassword = bcrypt.hashSync(password, 8);

    db.run(
        "INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)",
        [username, email, hashedPassword, fullName],
        function (err) {
            if (err) {
                console.error(err);
                if (err.message.includes('UNIQUE constraint')) {
                    return res.status(400).json({ message: 'Username or email already exists' });
                }
                return res.status(500).json({ message: 'Database error' });
            }

            const token = jwt.sign({ id: this.lastID, username }, SECRET_KEY);
            res.json({ token, user: { id: this.lastID, username, email, full_name: fullName } });
        }
    );
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    // Allow login with email OR username
    const sql = "SELECT * FROM users WHERE email = ? OR username = ?";
    db.get(sql, [email, email], (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).json({ message: 'Invalid password' });

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
        res.json({ token, user });
    });
});

app.get('/api/auth/me', authenticate, (req, res) => {
    const sql = `
        SELECT id, username, email, bio, full_name, created_at,
        (SELECT count(*) FROM posts WHERE user_id = u.id) as posts_count,
        (SELECT count(*) FROM followers WHERE following_id = u.id) as followers_count,
        (SELECT count(*) FROM followers WHERE follower_id = u.id) as following_count
        FROM users u WHERE id = ?
    `;

    db.get(sql, [req.user.id], (err, user) => {
        if (err) return res.status(500).send(err);
        if (!user) return res.sendStatus(404);
        res.json(user);
    });
});

// Posts
app.get('/api/posts', authenticate, (req, res) => {
    const sql = `
        SELECT p.*, u.username, 
        (SELECT count(*) FROM likes WHERE post_id = p.id) as likes_count,
        (SELECT count(*) FROM comments WHERE post_id = p.id) as comments_count,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as user_liked
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
    `;
    db.all(sql, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows.map(r => ({ ...r, user_liked: !!r.user_liked })));
    });
});

app.post('/api/posts', authenticate, (req, res) => {
    const { content, image_url, location } = req.body;
    db.run(
        "INSERT INTO posts (user_id, content, image_url, location) VALUES (?, ?, ?, ?)",
        [req.user.id, content, image_url, location],
        function (err) {
            if (err) return res.status(500).json(err);
            res.json({ success: true, id: this.lastID });
        }
    );
});

app.post('/api/posts/:id/like', authenticate, (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    db.get("SELECT * FROM likes WHERE post_id = ? AND user_id = ?", [postId, userId], (err, row) => {
        if (err) return res.status(500).send(err);

        if (row) {
            db.run("DELETE FROM likes WHERE post_id = ? AND user_id = ?", [postId, userId], (err) => {
                if (err) return res.status(500).send(err);
                res.json({ success: true, liked: false });
            });
        } else {
            db.run("INSERT INTO likes (post_id, user_id) VALUES (?, ?)", [postId, userId], function (err) {
                if (err) return res.status(500).send(err);

                // Create Notification
                db.get("SELECT user_id FROM posts WHERE id = ?", [postId], (err, post) => {
                    if (post) createNotification(post.user_id, userId, 'like', postId);
                });

                res.json({ success: true, liked: true });
            });
        }
    });
});

app.post('/api/posts/:id/comments', authenticate, (req, res) => {
    const { content } = req.body;
    const postId = req.params.id;
    const userId = req.user.id;

    db.run("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)",
        [postId, userId, content],
        function (err) {
            if (err) return res.status(500).send(err);

            // Create Notification
            db.get("SELECT user_id FROM posts WHERE id = ?", [postId], (err, post) => {
                if (post) createNotification(post.user_id, userId, 'comment', postId);
            });

            res.json({ success: true });
        }
    );
});

// Users & Suggestions
app.get('/api/users/suggestions', authenticate, (req, res) => {
    // Get valid users who are NOT me and NOT already followed
    const sql = `
        SELECT id, username, full_name, 
        substring(username, 1, 1) as initial 
        FROM users 
        WHERE id != ? 
        AND id NOT IN (SELECT following_id FROM followers WHERE follower_id = ?)
        ORDER BY random()
        LIMIT 10
    `;
    db.all(sql, [req.user.id, req.user.id], (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});

app.post('/api/users/:id/follow', authenticate, (req, res) => {
    const targetUserId = req.params.id;
    db.run("INSERT INTO followers (follower_id, following_id) VALUES (?, ?)",
        [req.user.id, targetUserId],
        function (err) {
            if (err) return res.status(500).json({ message: 'Already following or error' });

            createNotification(targetUserId, req.user.id, 'follow', null);
            res.json({ success: true });
        }
    );
});

// Notifications
app.get('/api/notifications', authenticate, (req, res) => {
    // Mark all as read when fetching
    db.run("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [req.user.id]);

    const sql = `
        SELECT n.*, u.username as actor_username, u.full_name as actor_name 
        FROM notifications n
        JOIN users u ON n.actor_id = u.id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
        LIMIT 20
    `;
    db.all(sql, [req.user.id], (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});

// Notification Counts
app.get('/api/notifications/unread-count', authenticate, (req, res) => {
    const sqlNotifs = "SELECT count(*) as count FROM notifications WHERE user_id = ? AND is_read = 0";
    const sqlMsgs = "SELECT count(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0";

    db.get(sqlNotifs, [req.user.id], (err, rowNotifs) => {
        if (err) return res.status(500).send(err);

        db.get(sqlMsgs, [req.user.id], (err, rowMsgs) => {
            if (err) return res.status(500).send(err);
            res.json({
                notifications: rowNotifs ? rowNotifs.count : 0,
                messages: rowMsgs ? rowMsgs.count : 0
            });
        });
    });
});


// Messages
app.get('/api/messages/conversations', authenticate, (req, res) => {
    // Get list of recent conversations
    // We group by the partner and get the latest message
    const sql = `
        SELECT 
            CASE 
                WHEN sender_id = ? THEN receiver_id 
                ELSE sender_id 
            END as partner_id,
            MAX(created_at) as last_msg_time,
            content as last_msg_content
        FROM messages 
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY partner_id
        ORDER BY last_msg_time DESC
    `;

    db.all(sql, [req.user.id, req.user.id, req.user.id], async (err, rows) => {
        if (err) return res.status(500).send(err);

        const conversations = [];
        for (const row of rows) {
            const user = await new Promise((resolve) => {
                db.get("SELECT id, username, full_name FROM users WHERE id = ?", [row.partner_id], (err, u) => resolve(u));
            });
            if (user) {
                conversations.push({
                    ...user,
                    last_message: row.last_msg_content,
                    time: row.last_msg_time
                });
            }
        }
        res.json(conversations);
    });
});

app.get('/api/messages/:userId', authenticate, (req, res) => {
    const otherId = req.params.userId;

    // Mark messages from this user as read
    db.run("UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?", [otherId, req.user.id]);

    const sql = `
        SELECT * FROM messages 
        WHERE (sender_id = ? AND receiver_id = ?) 
           OR (sender_id = ? AND receiver_id = ?)
        ORDER BY created_at ASC
    `;
    db.all(sql, [req.user.id, otherId, otherId, req.user.id], (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});

app.post('/api/messages', authenticate, (req, res) => {
    const { receiver_id, content } = req.body;
    db.run("INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
        [req.user.id, receiver_id, content],
        function (err) {
            if (err) return res.status(500).send(err);
            res.json({ success: true, id: this.lastID });
        }
    );
});

// Search Users
app.get('/api/users/search', authenticate, (req, res) => {
    const query = req.query.q;
    if (!query) return res.json([]);

    const sql = "SELECT id, username, full_name, image_url FROM users WHERE username LIKE ? OR full_name LIKE ? LIMIT 10";
    const pattern = `%${query}%`;
    db.all(sql, [pattern, pattern], (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});

// Update User Profile
app.put('/api/users/me', authenticate, (req, res) => {
    const { full_name, bio } = req.body;
    db.run("UPDATE users SET full_name = ?, bio = ? WHERE id = ?", [full_name, bio, req.user.id], function (err) {
        if (err) {
            console.error('Update profile error:', err);
            return res.status(500).send(err);
        }
        res.json({ success: true });
    });
});

// Delete Post
app.delete('/api/posts/:id', authenticate, (req, res) => {
    const postId = req.params.id;
    // Manual Cascade deletion
    db.serialize(() => {
        db.run("DELETE FROM likes WHERE post_id = ?", [postId]);
        db.run("DELETE FROM comments WHERE post_id = ?", [postId]);
        // Note: notifications deletion is a bit loose on type check, but cleans up ref
        db.run("DELETE FROM notifications WHERE entity_id = ? AND (type='like' OR type='comment')", [postId]);

        db.run("DELETE FROM posts WHERE id = ? AND user_id = ?", [postId, req.user.id], function (err) {
            if (err) {
                console.error('Delete post error:', err);
                return res.status(500).send(err);
            }
            if (this.changes === 0) return res.status(403).json({ message: "Unauthorized or post not found" });
            res.json({ success: true });
        });
    });
});

// Start
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
