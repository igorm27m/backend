"use strict";

import { Router } from 'express';
import { getLogin, getVerifyToken } from '../controllers/admin.controller.js';

const router = Router();

router.post("/login", getLogin);
router.post("/verify-token", getVerifyToken);

export default router; // exportamos
