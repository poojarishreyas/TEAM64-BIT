import { getNextProjectId, getCurrentCounter } from '../services/projectCounter.service.js';

/**
 * Generate next project ID based on state code
 */
export const generateProjectId = async (req, res) => {
    try {
        const { stateCode } = req.body;

        if (!stateCode || stateCode.length !== 2) {
            return res.status(400).json({
                success: false,
                error: "State code must be 2 characters (e.g., 'KA', 'MH')"
            });
        }

        const projectId = getNextProjectId(stateCode.toUpperCase());

        return res.json({
            success: true,
            projectId,
            counter: getCurrentCounter()
        });
    } catch (err) {
        console.error('Error generating project ID:', err);
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

/**
 * Get current counter value
 */
export const getCounter = async (req, res) => {
    try {
        const counter = getCurrentCounter();
        return res.json({ success: true, counter });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
