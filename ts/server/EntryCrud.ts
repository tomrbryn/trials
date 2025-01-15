import type { Database } from "sqlite";

// Middleware to handle async errors
export function asyncMiddleware(middleware) {
    return (req, res, next) => Promise.resolve(middleware(req, res, next)).catch(next);
}

export function createCrudTableEndpoints(app, db: Database, tableName: string) {
    // POST: Add a new level
    app.post(`/trials/api/${tableName}`, asyncMiddleware(async (req, res) => {
        const { info, json, base64 } = req.body;
        info.created = new Date().toISOString();
        const result = await db.run(`INSERT INTO ${tableName} (info, json, base64) VALUES (?, ?, ?)`, [JSON.stringify(info), JSON.stringify(json), base64]);
        res.status(201).json({ id: result.lastID });
    }));
    
    // PUT: Update a level by id
    app.put(`/trials/api/${tableName}/:id`, asyncMiddleware(async (req, res) => {
        const { id } = req.params;
        const { info, json, base64 } = req.body;
        info.updated = new Date().toISOString();
        const result = await db.run(`UPDATE ${tableName} SET info = ?, json = ?, base64 = ? WHERE id = ?`, [JSON.stringify(info), JSON.stringify(json), base64, id]);
        res.status(200).json({ updated: result.changes });
    }));
    
    // DELETE: Delete a level by id
    app.delete(`/trials/api/${tableName}/:id`, asyncMiddleware(async (req, res) => {
        const { id } = req.params;
        const result = await db.run(`DELETE FROM ${tableName} WHERE id = ?`, id);
        res.status(200).json({ deleted: result.changes });
    }));
    
    // GET: Get id and info for all levels
    app.get(`/trials/api/${tableName}`, asyncMiddleware(async (req, res) => {
        let rows = await db.all(`SELECT id, info FROM ${tableName}`)
        rows.forEach(row => row.info = JSON.parse(row.info));
        res.status(200).json(rows);
    }));
    
    // GET: Get level info, json, and base64 by id
    app.get(`/trials/api/${tableName}/:id`, asyncMiddleware(async (req, res) => {
        const { id } = req.params;
        const row = await db.get(`SELECT * FROM levels WHERE id = ?`, id);
        if (!row) {
            return res.status(404).json({ error: 'Level not found' });
        }
        row.info = JSON.parse(row.info);
        row.json = JSON.parse(row.json);
        res.status(200).json(row);
    }));
}