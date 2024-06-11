"use strict";

import {Router} from 'express';
import { authenticateJWT } from '../auth.middleware.js';
import {
  addJornadas, deleteEnfrentamiento,
  getAlumnosInicio, getDatosLiga,
  getJornadas, getGrupos, getPartidos,
  updateEnfrentamiento

} from '../controllers/welder.controller.js';

const router = Router();

router.get("/jornadas/:idLiga&:idGrupo", getJornadas);
router.get("/partidos/:id", getPartidos);
router.get("/alumnosinicio/:id", getAlumnosInicio);
router.get("/grupos", getGrupos);
router.get("/datosLiga", getDatosLiga);

router.post("/jornadas", authenticateJWT, addJornadas);
router.delete("/enfrentamiento/:id", authenticateJWT, deleteEnfrentamiento);
router.put("/enfrentamiento/:id", authenticateJWT, updateEnfrentamiento);

export default router; // exportamos
