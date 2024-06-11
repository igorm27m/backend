"use strict";

import {Router} from 'express';
import { authenticateJWT } from '../auth.middleware.js';
import {
    addPatrocinador,
    deletePatrocinador,
    getPatrocinadores,
    updatePatrocinador
} from "../controllers/patrocinador.controller.js";

const router = Router();

router.get("/patrocinadores", getPatrocinadores);
router.post("/patrocinador", authenticateJWT, addPatrocinador);
router.put("/patrocinador/:id", authenticateJWT, updatePatrocinador);
router.delete("/patrocinador/:id", authenticateJWT, deletePatrocinador);

export default router; // exportamos
