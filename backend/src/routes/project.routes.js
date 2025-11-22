import express from 'express';
import multer from 'multer';
import { registerProject, uploadGeoJSON, uploadPhotos } from '../controllers/project.controller.js';
import { generateProjectId, getCounter } from '../controllers/projectId.controller.js';

const router = express.Router();

// Configure multer for memory storage (files stored in buffer)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
});

router.post('/register', registerProject);
router.post("/geojson/upload", uploadGeoJSON);
router.post("/photos/upload", upload.array('photos', 3), uploadPhotos); // Accept up to 3 photos
router.post("/generate-id", generateProjectId); // Generate next project ID
router.get("/counter", getCounter); // Get current counter


export default router;
