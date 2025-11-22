const pool = require('../config/database');

class GridService {
    /**
     * Store grid cells when project boundary is created
     */
    async storeGridCells(projectId, gridData) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Insert each grid cell
            for (const feature of gridData.features) {
                const gridId = feature.properties.gridID;
                
                await client.query(`
                    INSERT INTO grid_cells (project_id, grid_id, grid_geojson, member_count, is_full)
                    VALUES ($1, $2, $3, 0, FALSE)
                    ON CONFLICT (project_id, grid_id) DO NOTHING
                `, [projectId, gridId, JSON.stringify(feature)]);
            }

            await client.query('COMMIT');
            
            console.log(`✅ Stored ${gridData.features.length} grid cells for project ${projectId}`);
            return { success: true, count: gridData.features.length };
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error storing grid cells:', err);
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Get available grids (not full) for a project
     */
    async getAvailableGrids(projectId) {
        const result = await pool.query(`
            SELECT id, grid_id, grid_geojson, member_count
            FROM grid_cells
            WHERE project_id = $1 AND is_full = FALSE
            ORDER BY grid_id
        `, [projectId]);

        return result.rows;
    }

    /**
     * Register a member to a grid cell
     */
    async registerMemberToGrid(gridCellId, memberData) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Check current member count
            const gridCheck = await client.query(`
                SELECT member_count FROM grid_cells WHERE id = $1 FOR UPDATE
            `, [gridCellId]);

            if (gridCheck.rows.length === 0) {
                throw new Error('Grid cell not found');
            }

            const currentCount = gridCheck.rows[0].member_count;
            
            if (currentCount >= 5) {
                throw new Error('Grid cell is full (max 5 members)');
            }

            // Insert member
            const memberResult = await client.query(`
                INSERT INTO grid_members 
                (grid_cell_id, member_name, member_wallet, member_phone, photo_cid, verification_status)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `, [
                gridCellId,
                memberData.name,
                memberData.wallet,
                memberData.phone,
                memberData.photoCID,
                'PENDING'
            ]);

            // Update grid cell member count
            const newCount = currentCount + 1;
            const isFull = newCount >= 5;

            await client.query(`
                UPDATE grid_cells
                SET member_count = $1, is_full = $2
                WHERE id = $3
            `, [newCount, isFull, gridCellId]);

            await client.query('COMMIT');

            return {
                success: true,
                memberId: memberResult.rows[0].id,
                gridCellId,
                memberCount: newCount,
                isFull
            };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Get grid cell details with members
     */
    async getGridCellDetails(gridCellId) {
        const gridResult = await pool.query(`
            SELECT * FROM grid_cells WHERE id = $1
        `, [gridCellId]);

        if (gridResult.rows.length === 0) {
            return null;
        }

        const membersResult = await pool.query(`
            SELECT id, member_name, member_wallet, member_phone, 
                   registration_date, verification_status, photo_cid
            FROM grid_members
            WHERE grid_cell_id = $1
            ORDER BY registration_date
        `, [gridCellId]);

        return {
            grid: gridResult.rows[0],
            members: membersResult.rows
        };
    }

    /**
     * Get all grids for a project with member counts
     */
    async getProjectGrids(projectId) {
        const result = await pool.query(`
            SELECT 
                gc.id,
                gc.grid_id,
                gc.member_count,
                gc.is_full,
                gc.grid_geojson,
                COUNT(gm.id) as actual_member_count
            FROM grid_cells gc
            LEFT JOIN grid_members gm ON gc.id = gm.grid_cell_id
            WHERE gc.project_id = $1
            GROUP BY gc.id
            ORDER BY gc.grid_id
        `, [projectId]);

        return result.rows;
    }
}

module.exports = new GridService();
