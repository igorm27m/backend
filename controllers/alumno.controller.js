
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import conexion from "../mysql_conector.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadPath = path.join(__dirname,'../../src/assets/img/');

export const getAlumnos = async (req, res) => {
  try {
    const idLiga = req.params.id;
    if (idLiga === 0 && idLiga === undefined){
      const [result] = await conexion.query('SELECT * FROM alumnos ORDER BY nombre');
      res.status(200).json(result);
    } else {
      const [result] = await conexion.query('SELECT * FROM alumnos WHERE id_liga = ? ORDER BY nombre', [idLiga]);
      res.status(200).json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      "mensaje":error
    })
  }
}

export const getAlumnosCalificacion = async (req, res) => {
    try {
        const idGrupo = req.params.id;
        const [result] = await conexion.query('SELECT id FROM ligas WHERE activa = 1');
        const idLiga = result[0].id;

        if (idGrupo == 0){
            const [result] = await conexion.query('SELECT * FROM alumnos WHERE id_liga =? ORDER BY nombre', [idLiga]);
            res.status(200).json(result);
        } else {
            const [result] = await conexion.query('SELECT * FROM alumnos WHERE id_liga = ? AND grupo =? ORDER BY nombre', [idLiga, idGrupo]);
            res.status(200).json(result);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "mensaje":error
        })
    }
}

export const addAlumno = async (req, res) => {
  try {
      console.log(req.body);
      const { nombre, liga, grupo } = req.body;
      const imgFile = req.files ? req.files.img : null;

      let imgPath = '';
      if (imgFile) {
          imgPath = `${Date.now()}_${imgFile.name}`;
          const savePath = path.join(uploadPath, imgPath);
          imgFile.mv(savePath);
      }

    const [result] = await conexion.query('INSERT INTO alumnos (nombre, img, dia, hora, id_liga, grupo) VALUES (?, ?, CURDATE(), CURTIME(), ?, ?)', [nombre, imgPath, liga, grupo]);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      "mensaje":error
    })
  }
}

export const updateAlumno = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, liga, grupo } = req.body;
        const imgFile = req.files ? req.files.img : null;

        let imgPath = '';
        if (imgFile) {
            imgPath = `${Date.now()}_${imgFile.name}`;
            const savePath = path.join(uploadPath, imgPath);
            imgFile.mv(savePath);
        }
        if (imgPath === '') {
            const [result] = await conexion.query('UPDATE alumnos SET nombre =?, id_liga =?, grupo=? WHERE id =?', [nombre, liga, grupo, id]);
        } else {
            const [result] = await conexion.query('UPDATE alumnos SET nombre =?, img =?, id_liga =?, grupo=? WHERE id =?', [nombre, imgPath, liga, grupo, id]);
        }

        res.status(200).json({ message: 'Alumno actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el alumno' });
    }
}

export const deleteAlumno = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM alumnos WHERE id = ?';
        await conexion.query(query, [id]);

        res.status(200).json({ message: 'Alumno eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el alumno' });
    }
};
