import fs from 'fs';
import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import {open} from 'sqlite';
import path from 'path';
import bcrypt from 'bcrypt';
import session from 'express-session';
import { fileURLToPath } from 'url';

// Middleware to handle async errors
function asyncMiddleware(middleware) {
    return (req, res, next) => Promise.resolve(middleware(req, res, next)).catch(next);
}

// Get the current module's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express()

const dbPath = path.resolve(__dirname, '../data/trials.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// Types
interface User {
    id: number;
    username: string;
    password: string;
}

interface Highscore {
    userId: number;
    levelId: number;
    score: number;
    ticks: number;
    tries: number;
}
(async () => {
    let db = await open({filename: dbPath,driver: sqlite3.Database});
    // const db = new sqlite3.Database(dbPath);

    // Create levels table if it doesn't exist
    await db.run(`CREATE TABLE IF NOT EXISTS levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        info TEXT,
        json TEXT,
        base64 TEXT
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS highscores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        level_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        ticks INTEGER NOT NULL,
        tries INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (level_id) REFERENCES levels(id)
    )`);

    await db.run(`CREATE INDEX IF NOT EXISTS idx_highscore_score ON highscores (score DESC)`);

    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(session({
        secret: 'your_secret_key',  // Change this to something secure
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }  // Set to true if using https
    }));    


    app.post('/trials/user/register', asyncMiddleware(async (req: Request, res: Response) => {
        const { username, password } = req.body;

        // Check if user exists
        const user = await db.get<User>("SELECT * FROM users WHERE username = ?", [username]);
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword]);
        res.json({ message: 'User registered successfully' });
    }));

    app.post('/trials/user/login', asyncMiddleware(async (req: Request, res: Response) => {
        const { username, password } = req.body;

        const user = await db.get<User>("SELECT * FROM users WHERE username = ?", [username]);
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        // Compare password with hash
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        req.session.userId = user.id;  // Store user ID in session
        res.json({ message: 'Logged in successfully' });
    }));

    app.post('/trials/user/logout', asyncMiddleware(async (req: Request, res: Response) => {
        req.session.destroy(() => {
            res.json({ message: 'Logged out successfully' });
        });
    }));

    app.post('/trials/highscores/submit-score', asyncMiddleware(async (req: Request, res: Response) => {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { levelId, score, ticks, tries } = req.body as Highscore;

        // Check if the level exists
        const level = await db.get("SELECT * FROM levels WHERE id = ?", [levelId]);
        if (!level) {
            return res.status(400).json({ error: 'Level not found' });
        }

        // Insert or update highscore for this user and level
        await db.run(
            `INSERT OR REPLACE INTO highscores (user_id, level_id, score, ticks, tries) 
            VALUES (?, ?, ?, ?, ?)`,
            [req.session.userId, levelId, score, ticks, tries]
        );

        res.json({ message: 'Highscore submitted successfully' });
    }));

    // Fetch highscore list (top 10 scores for a given level)
    app.get('/trials/highscores/:levelId', asyncMiddleware(async (req: Request, res: Response) => {
        const levelId = parseInt(req.params.levelId);

        const highscores = await db.all<{ username: string, score: number, ticks: number, tries: number }[]>(
            `SELECT u.username, h.score, h.ticks, h.tries 
            FROM highscores h 
            JOIN users u ON h.user_id = u.id
            WHERE h.level_id = ?
            ORDER BY h.score DESC LIMIT 10`,
            [levelId]
        );

        res.json(highscores);
    }));

    
    // POST: Add a new level
    app.post('/trials/api/levels', asyncMiddleware(async (req, res) => {
        const { info, json, base64 } = req.body;
        info.created = new Date().toISOString();
        console.log("post", req.body);
        const result = await db.run(`INSERT INTO levels (info, json, base64) VALUES (?, ?, ?)`, [JSON.stringify(info), JSON.stringify(json), base64]);
        res.status(201).json({ id: result.lastID });
    }));
    
    // PUT: Update a level by id
    app.put('/trials/api/levels/:id', asyncMiddleware(async (req, res) => {
        const { id } = req.params;
        const { info, json, base64 } = req.body;
        info.updated = new Date().toISOString();
        console.log("put", req.body);
        const result = await db.run(`UPDATE levels SET info = ?, json = ?, base64 = ? WHERE id = ?`, [JSON.stringify(info), JSON.stringify(json), base64, id]);
        res.status(200).json({ updated: result.changes });
    }));
    
    // DELETE: Delete a level by id
    app.delete('/trials/api/levels/:id', asyncMiddleware(async (req, res) => {
        const { id } = req.params;
        const result = await db.run(`DELETE FROM levels WHERE id = ?`, id);
        res.status(200).json({ deleted: result.changes });
    }));
    
    // GET: Get all levels
    app.get('/trials/api/levels', asyncMiddleware(async (req, res) => {
        let rows = await db.all(`SELECT id, info FROM levels`)
        rows.forEach(row => row.info = JSON.parse(row.info));
        res.status(200).json(rows);
    }));
    
    // GET: Get all levels including tries and ticks for a user
    app.get('/trials/api/levels/user/:userId', asyncMiddleware(async (req, res) => {
        const { userId } = req.params;
        console.log("userId", userId);


        const query = `
            SELECT 
                levels.info,
                highscores.tries,
                highscores.ticks
            FROM 
                levels
            LEFT JOIN 
                highscores 
            ON 
                levels.id = highscores.level_id 
            AND 
                highscores.user_id = ?
        `;

        const rows = await db.all(query, [userId]);

        rows.forEach(row => row.info = JSON.parse(row.info));
        res.status(200).json(rows);
    }));
    
    // GET: Get level info, json, and base64 by id
    app.get('/trials/api/levels/:id', asyncMiddleware(async (req, res) => {
        const { id } = req.params;
        const row = await db.get(`SELECT * FROM levels WHERE id = ?`, id);
        if (!row) {
            return res.status(404).json({ error: 'Level not found' });
        }
        row.info = JSON.parse(row.info);
        row.json = JSON.parse(row.json);
        res.status(200).json(row);
    }));
    
    app.use("/trials/public", express.static('static'));
    
    let clients = [];
    app.get('/trials/events', (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();
        clients.push(res);
        req.on('close', () => clients = clients.filter(client => client !== res));
    });
    
    async function notifyClients(filename) {
        for (let client of clients) {
            client.write(`data: ${filename}\n\n`);
        }
    }
    
    fs.watch('./static', (eventType, filename) => notifyClients(filename));
    
    app.get("/trials/editor", (req, res) => {
        res.send(`<!DOCTYPE html>
            <html lang="en">
            <head>
            <script type="module" src="/trials/public/Editor.js"></script>
            <link href="/trials/public/Editor.css" rel="stylesheet">
            <link href="/trials/public/Common.css" rel="stylesheet">
            </head>
            <body>
            </body>
            </html>
        `);
    });
    
    app.get("/trials/game", (req, res) => {
        res.send(`<!DOCTYPE html>
            <html lang="en">
            <head>
            <script type="module" src="/trials/public/Game.js"></script>
            <link href="/trials/public/Game.css" rel="stylesheet">
            <link href="/trials/public/Common.css" rel="stylesheet">
            </head>
            <body>
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex;">
                    <canvas id="gameCanvas" style="flex: 1; min-width: 0; min-height: 0;"></canvas>
                </div>
            </body>
            </html>
        `);
    });
    
    // Error handling middleware and must be last
    app.use((err, req, res, next) => {
        console.error("fallback error", err);
        res.status(400).json({error: err.message ?? "" + err});
    });    
    
    app.listen(6969)
    console.log("app.js started on port 6969");
})();
