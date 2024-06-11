// src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import { config } from "dotenv";
config(); // leer variabless de entorno

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Token inválido
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401); // Token no proporcionado
  }
};
