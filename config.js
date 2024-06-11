import { config } from "dotenv";
config(); // leer variabless de entorno

// para leer variabless de entorno, se utiliza el objeto process de node.js
// utilizar la propiedad env, donde se almacena todas la ss variables del dispositivo

export const PORT = process.env.PORT || 3000
export const DB_PORT = process.env.DB_PORT || 3306
export const DB_HOST = process.env.DB_HOST || 'localhost'
export const DB_USER = process.env.DB_USER || 'root'
export const DB_PASS = process.env.DB_PASS || ''
export const DB_DATABASE = process.env.DB_DATABASE || 'welder_legue'
