"use strict";

// configurar un servidor express
import express from 'express';
import routerWelder from "./routes/welder.route.js";
import routerAdmin from "./routes/admin.route.js";
import routerLiga from "./routes/liga.route.js";
import routerAlumno from "./routes/alumno.route.js";
import routerNoticias from "./routes/noticia.route.js";
import routerPatrocinadores from "./routes/patrocinador.route.js";
import { PORT } from './config.js';
import cors from 'cors';
import fileUpload from 'express-fileupload';


const app = express();  // creado objeto con la instancia express

app.use(cors());

// middleware
app.use(express.json());

app.use(fileUpload());

app.use(routerWelder);
app.use(routerAdmin);
app.use(routerLiga);
app.use(routerAlumno);
app.use(routerNoticias);
app.use(routerPatrocinadores);
// responde a los endpoints. Representa una accion de la API

// controlar si se pasa una ruta en la url
app.use((req, res) => {
    res.status(404).json({
        "mensaje": "endpoint no encontrado"
    })
})

export default app;
