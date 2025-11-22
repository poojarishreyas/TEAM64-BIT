import express from "express";
import { registerGridMember, getGridMembers, saveGrids, getLastGridId } from "../controllers/grid.controller.js";

const router = express.Router();

router.post("/register", registerGridMember);
router.post("/save", saveGrids);
router.get("/last-id", getLastGridId);
router.get("/:grid_id/members", getGridMembers);

export default router;
