import { Router } from "express";
import {
  getProgram,
  listPrograms
} from "../controllers/programController.js";

const router = Router();

router.get("/", listPrograms);
router.get("/:programId", getProgram);

export default router;
