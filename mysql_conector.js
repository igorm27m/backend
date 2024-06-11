"use strict";

// importar el paquete mysql para realizar la conexion

import { createPool } from "mysql2/promise"; // para trabajar con promesas
import { DB_PORT, DB_HOST, DB_PASS, DB_USER, DB_DATABASE } from "./config.js";
// import { createConnection } from "mysql2";

const conexion = createPool(    //establecer caracteristicas de la conexion
    {
        "host":DB_HOST,
        "user":DB_USER,
        "password":DB_PASS,
        "database":DB_DATABASE,
        "port":DB_PORT
    }
);

// conexion.connect(err => {
//     if (err) {
//         return console.error('error connecting: ' + err.stack);
//     }
//     console.log('connected as id ' + connection.threadId);
// });

export default conexion; // exportamos
