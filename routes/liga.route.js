"use strict";

import {Router} from 'express';
import { authenticateJWT } from '../auth.middleware.js';
import {
  addLiga,
  deleteLiga,
  getLiga,
  getLigas,
  updateLiga
} from '../controllers/liga.controller.js';

const router = Router();

router.get("/ligas", getLigas);
router.get("/liga", getLiga);
router.post('/ligas', authenticateJWT, addLiga);
router.delete('/ligas/:id', authenticateJWT, deleteLiga);
router.put('/ligas/:id', authenticateJWT, updateLiga);

export default router; // exportamos
