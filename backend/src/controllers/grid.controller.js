import pool from "../db.js";

export const registerGridMember = async (req, res) => {
    const { grid_id, member_name } = req.body;

    if (!grid_id || !member_name) {
        return res.status(400).json({ error: "grid_id and member_name are required" });
    }

    try {
        const query = `
      INSERT INTO grid_members (grid_id, member_name)
      VALUES ($1, $2)
      RETURNING *;
    `;
        const values = [grid_id, member_name];
        const result = await pool.query(query, values);

        res.status(201).json({
            message: "Successfully registered to grid",
            member: result.rows[0],
        });
    } catch (err) {
        // Check for the specific error message from the trigger
        if (err.message.includes("is full (5/5)")) {
            return res.status(409).json({ error: err.message }); // 409 Conflict
        }
        console.error("Error registering grid member:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getGridMembers = async (req, res) => {
    const { grid_id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM grid_members WHERE grid_id = $1', [grid_id]);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching grid members:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const saveGrids = async (req, res) => {
    const { features } = req.body;

    if (!features || !Array.isArray(features)) {
        return res.status(400).json({ error: "Invalid grid data. Expected an array of features." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const query = `
      INSERT INTO grids (grid_id, geometry)
      VALUES ($1, $2)
      ON CONFLICT (grid_id) DO NOTHING;
    `;

        for (const feature of features) {
            const gridId = feature.properties.gridID;
            const geometry = feature.geometry;
            await client.query(query, [gridId, geometry]);
        }

        await client.query('COMMIT');
        console.log(`✓ Successfully saved ${features.length} grids to database`);
        res.status(201).json({ message: "Grids saved successfully", count: features.length });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error saving grids:", err);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        client.release();
    }
};

export const getLastGridId = async (req, res) => {
    try {
        const query = "SELECT grid_id FROM grids ORDER BY id DESC LIMIT 1";
        const result = await pool.query(query);

        let lastId = 0;
        if (result.rows.length > 0) {
            const lastGridId = result.rows[0].grid_id; // e.g., "G-088"
            const parts = lastGridId.split("-");
            if (parts.length === 2 && !isNaN(parts[1])) {
                lastId = parseInt(parts[1], 10);
            }
        }

        res.json({ lastId });
    } catch (err) {
        console.error("Error fetching last grid ID:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
