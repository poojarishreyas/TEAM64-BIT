const pool = require('../config/database');

async function createTables() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Create projects table
        await client.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id SERIAL PRIMARY KEY,
                project_id VARCHAR(50) UNIQUE NOT NULL,
                project_name VARCHAR(255) NOT NULL,
                state VARCHAR(100),
                district VARCHAR(100),
                village VARCHAR(100),
                officer_name VARCHAR(255),
                officer_wallet VARCHAR(42),
                geo_boundary_cid TEXT,
                grids_cid TEXT,
                registration_cid TEXT,
                blockchain_tx_hash VARCHAR(66),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create grid_cells table - stores each grid with max 5 members
        await client.query(`
            CREATE TABLE IF NOT EXISTS grid_cells (
                id SERIAL PRIMARY KEY,
                project_id VARCHAR(50) REFERENCES projects(project_id) ON DELETE CASCADE,
                grid_id VARCHAR(20) NOT NULL,
                grid_geojson JSONB,
                member_count INTEGER DEFAULT 0 CHECK (member_count <= 5),
                is_full BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(project_id, grid_id)
            );
        `);

        // Create grid_members table - tracks individual registrations
        await client.query(`
            CREATE TABLE IF NOT EXISTS grid_members (
                id SERIAL PRIMARY KEY,
                grid_cell_id INTEGER REFERENCES grid_cells(id) ON DELETE CASCADE,
                member_name VARCHAR(255) NOT NULL,
                member_wallet VARCHAR(42),
                member_phone VARCHAR(20),
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                verification_status VARCHAR(20) DEFAULT 'PENDING',
                photo_cid TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create indexes for faster queries
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_grid_cells_project_id ON grid_cells(project_id);
            CREATE INDEX IF NOT EXISTS idx_grid_cells_grid_id ON grid_cells(grid_id);
            CREATE INDEX IF NOT EXISTS idx_grid_cells_is_full ON grid_cells(is_full);
            CREATE INDEX IF NOT EXISTS idx_grid_members_grid_cell_id ON grid_members(grid_cell_id);
        `);

        await client.query('COMMIT');
        console.log('✅ Database tables created successfully');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error creating tables:', err);
        throw err;
    } finally {
        client.release();
    }
}

// Run migration
if (require.main === module) {
    createTables()
        .then(() => {
            console.log('✅ Migration completed');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ Migration failed:', err);
            process.exit(1);
        });
}

module.exports = { createTables };
