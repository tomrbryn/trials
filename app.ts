import fs from 'fs';
import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import {open} from 'sqlite';
import path from 'path';
import bcrypt from 'bcrypt';
import session from 'express-session';
import SQLiteStore from 'connect-sqlite3';
import { fileURLToPath } from 'url';
import { Highscore } from './ts/Utils.ts';
import { asyncMiddleware, createCrudTableEndpoints } from './ts/server/EntryCrud.ts';


// Get the current module's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express()

const dataDir = path.resolve(__dirname, './data');
const dbPath = path.resolve(dataDir, 'trials.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

interface User {
    id: number;
    username: string;
    password: string;
}

(async () => {
    let db = await open({filename: dbPath, driver: sqlite3.Database});
    const SQLiteSessionStore = SQLiteStore(session); // connect-sqlite3 needs this

    // Create levels table if it doesn't exist
    await db.run(`CREATE TABLE IF NOT EXISTS levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        info TEXT,
        json TEXT,
        base64 TEXT
    )`);
    
    await db.run(`CREATE TABLE IF NOT EXISTS riders (
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
        inputRecording TEXT,
        UNIQUE(user_id, level_id),        
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (level_id) REFERENCES levels(id)
    )`);

    await db.run(`CREATE INDEX IF NOT EXISTS idx_highscore_score ON highscores (score DESC)`);

    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(session({
        store: new SQLiteSessionStore({dir: dataDir, db: "session.sqlite", concurrentDB: true}),        
        // Change this to something secure
        secret: 'your_secret_key',  
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }  // Set to true if using https
    }));    

    app.all("*", (req, res, next) => {
        console.log(req.method, req.url, "userId", req.session?.userId);
        next();
    });


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
        console.log("User registered successfully", username);
    }));

    app.post('/trials/user/login', asyncMiddleware(async (req: Request, res: Response) => {
        const { username, password } = req.body;

        const user = await db.get<User>("SELECT * FROM users WHERE username = ?", [username]);
        if (!user) {
            console.log("invalid username");
            return res.status(400).json({ error: 'Invalid username' });
        }

        // Compare password with hash
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log("invalid password");
            return res.status(400).json({ error: 'Invalid password' });
        }

        req.session.userId = user.id;  // Store user ID in session
        res.json({ message: 'Logged in successfully' });
    }));

    app.post('/trials/api/user/logout', asyncMiddleware(async (req: Request, res: Response) => {
        console.log("logout", req.session.userId);
        req.session.destroy(() => {
            res.json({ message: 'Logged out successfully' });
        });
    }));

    app.get('/trials/api/session', async (req: Request, res: Response) => {
        if (req.session.userId) {
            const user = await db.get("SELECT id AS userId, username FROM users WHERE id = ?", [req.session.userId]);
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } else {
            res.status(401).json({ error: 'Not authenticated' });
        }
    });    

    app.post('/trials/api/highscores', asyncMiddleware(async (req: Request, res: Response) => {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { levelId, score, ticks, tries, inputRecording } = req.body as Highscore;
        console.log("submit-score", levelId, score, ticks, tries, inputRecording);

        // Check if the level exists
        const level = await db.get("SELECT * FROM levels WHERE id = ?", [levelId]);
        if (!level) {
            return res.status(400).json({ error: 'Level not found' });
        }

        // Insert or update highscore for this user and level if the new score is lower
        await db.run(
            `INSERT INTO highscores (user_id, level_id, score, ticks, tries, inputRecording) 
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, level_id) DO UPDATE SET
            score = excluded.score,
            ticks = excluded.ticks,
            tries = excluded.tries,
            inputRecording = excluded.inputRecording
            WHERE excluded.score < highscores.score`,
            [req.session.userId, levelId, score, ticks, tries, inputRecording]
        );

        res.json({ message: 'Highscore submitted successfully' });
    }));

    // Fetch highscore list (top 10 scores for a given level)
    app.get('/trials/highscores/:levelId', asyncMiddleware(async (req: Request, res: Response) => {
        console.log("highscores", req.params);
        const levelId = parseInt(req.params.levelId);

        const highscores = await db.all<{ id: string, username: string, score: number, ticks: number, tries: number, rank: number }[]>(
            `SELECT h.id, u.username, h.score, h.ticks, h.tries, ROW_NUMBER() OVER (ORDER BY h.score ASC) AS rank 
            FROM highscores h 
            JOIN users u ON h.user_id = u.id
            WHERE h.level_id = ?
            ORDER BY h.score ASC
            `,
            [levelId]
        );
        // LIMIT ? OFFSET ?            
        // [levelId, 2, 2]

        console.log("highscores", highscores);

        res.json(highscores);
    }));

    // Fetch inputRecording for a given highscore
    app.get('/trials/highscores/:highscoreId/inputRecording', asyncMiddleware(async (req: Request, res: Response) => {
        const highscoreId = parseInt(req.params.highscoreId);
        const highscore = await db.get<{ inputRecording: string }>("SELECT inputRecording FROM highscores WHERE id = ?", [highscoreId]);
        if (!highscore) {
            return res.status(404).json({ error: 'Highscore not found' });
        }
        // convert highscore from base64 to arraybuffer and return buffer as binary
        let a = Buffer.from(highscore.inputRecording, 'base64').toString('binary');
        console.log("inputRecording", a);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.send(a);
        //res.json({ inputRecording: highscore.inputRecording });
    }));

    createCrudTableEndpoints(app, db, "levels");
    
    // GET: Get all levels including tries and ticks for current session user
    app.get(`/trials/api/levels/user/:userId`, asyncMiddleware(async (req, res) => {
        //console.log("get-levels", req.params, req.session);
        //const { userId } = req.params;
        const userId = req.session.userId;
        const query = `
            SELECT 
                levels.id,
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

    createCrudTableEndpoints(app, db, "riders");
    
    
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

    const getPage = (entryPoint) => {
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
            <script type="module" src="/trials/public/${entryPoint}.js"></script>
            <link href="/trials/public/${entryPoint}.css" rel="stylesheet">
            <link href="/trials/public/Common.css" rel="stylesheet">
            </head>
            <body></body>
            </html>
        `
    }
    
    app.get("/trials/rider", (req, res) => {
        res.send(getPage("RiderEditor"));
    });
    
    app.get("/trials/level", (req, res) => {
        res.send(getPage("LevelEditor"));
    });
    
    app.get("/trials/game", (req, res) => {
        res.send(getPage("Game"));
    });
    
    // Error handling middleware and must be last
    app.use((err, req, res, next) => {
        console.error("fallback error", err);
        res.status(400).json({error: err.message ?? "" + err});
    });    
    
    let port = process.env.PORT ?? 6969;
    app.listen(port);
    console.log(`app.js started on port ${port}`);
})();
