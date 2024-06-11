"use strict";

import {Router} from 'express';
import { authenticateJWT } from '../auth.middleware.js';
import {
    addNoticia,
    deleteNoticia,
    getNoticias,
    updateNoticia
} from "../controllers/noticia.controller.js";

const router = Router();


router.get("/noticias", getNoticias);
router.post("/noticia", authenticateJWT, addNoticia);
router.put("/noticia/:id", authenticateJWT, updateNoticia);
router.delete("/noticia/:id", authenticateJWT, deleteNoticia);

export default router; // exportamos
