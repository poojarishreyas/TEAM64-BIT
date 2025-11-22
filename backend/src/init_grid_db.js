import pool from "./db.js";

const createTableQuery = `
CREATE TABLE IF NOT EXISTS grid_members (
    id SERIAL PRIMARY KEY,
    grid_id TEXT NOT NULL,
    member_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
`;

const createFunctionQuery = `
CREATE OR REPLACE FUNCTION check_grid_limit()
RETURNS TRIGGER AS $$
DECLARE
    count_members INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_members
    FROM grid_members
    WHERE grid_id = NEW.grid_id;

    IF count_members >= 5 THEN
        RAISE EXCEPTION 'Grid % is full (5/5). Cannot register.', NEW.grid_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`;

const createTriggerQuery = `
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_grid_limit') THEN
        CREATE TRIGGER enforce_grid_limit
        BEFORE INSERT ON grid_members
        FOR EACH ROW
        EXECUTE FUNCTION check_grid_limit();
    END IF;
END
$$;
`;

async function initDb() {
    try {
        console.log("Creating grid_members table...");
        await pool.query(createTableQuery);
        console.log("Table created successfully.");

        console.log("Creating check_grid_limit function...");
        await pool.query(createFunctionQuery);
        console.log("Function created successfully.");

        console.log("Creating enforce_grid_limit trigger...");
        await pool.query(createTriggerQuery);
        console.log("Trigger created successfully.");

        console.log("Database setup complete.");
    } catch (err) {
        console.error("Error setting up database:", err);
    } finally {
        await pool.end();
    }
}

initDb();
