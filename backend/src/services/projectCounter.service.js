import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COUNTER_FILE = path.join(__dirname, '..', 'data', 'projectCounter.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize counter file if it doesn't exist
if (!fs.existsSync(COUNTER_FILE)) {
    fs.writeFileSync(COUNTER_FILE, JSON.stringify({ counter: 0 }, null, 2));
}

/**
 * Generate next project ID with auto-increment
 * Format: NCCR-{STATE_CODE}-{YEAR}-{NUMBER}
 * Example: NCCR-KA-2025-001
 */
export function getNextProjectId(stateCode) {
    try {
        // Read current counter
        const data = JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf8'));
        let counter = data.counter || 0;

        // Increment counter
        counter++;

        // Save updated counter
        fs.writeFileSync(COUNTER_FILE, JSON.stringify({ counter }, null, 2));

        // Generate project ID
        const year = new Date().getFullYear();
        const paddedNumber = String(counter).padStart(3, '0');
        const projectId = `NCCR-${stateCode}-${year}-${paddedNumber}`;

        console.log(`✓ Generated Project ID: ${projectId} (Counter: ${counter})`);

        return projectId;
    } catch (err) {
        console.error('Error generating project ID:', err);
        throw err;
    }
}

/**
 * Get current counter value (for debugging)
 */
export function getCurrentCounter() {
    try {
        const data = JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf8'));
        return data.counter || 0;
    } catch (err) {
        return 0;
    }
}

/**
 * Reset counter (for testing/admin purposes)
 */
export function resetCounter() {
    fs.writeFileSync(COUNTER_FILE, JSON.stringify({ counter: 0 }, null, 2));
    console.log('✓ Project counter reset to 0');
}
