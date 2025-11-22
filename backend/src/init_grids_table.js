import pool from "./db.js";

const createGridsTableQuery = `
CREATE TABLE IF NOT EXISTS grids (
    id SERIAL PRIMARY KEY,
    grid_id TEXT UNIQUE NOT NULL,
    geometry JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
`;

async function initGridsTable() {
    try {
        console.log("Creating grids table...");
        await pool.query(createGridsTableQuery);
        console.log("Grids table created successfully.");
    } catch (err) {
        console.error("Error creating grids table:", err);
    } finally {
        await pool.end();
    }
}

initGridsTable();
