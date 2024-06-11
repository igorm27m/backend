"use strict";

import {Router} from 'express';
import { authenticateJWT } from '../auth.middleware.js';
import {
    addAlumno,
    deleteAlumno,
    getAlumnos, getAlumnosCalificacion,
    updateAlumno
} from "../controllers/alumno.controller.js";

const router = Router();

router.get("/alumnos/:id", getAlumnos);
router.get("/alumnos-calificacion/:id", getAlumnosCalificacion);
router.post("/alumno", authenticateJWT, addAlumno);
router.put("/alumno/:id", authenticateJWT, updateAlumno);
router.delete("/alumno/:id", authenticateJWT, deleteAlumno);

export default router; // exportamos
