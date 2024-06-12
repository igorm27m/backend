
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
      const [result] = await conexion.query('SELECT A.id, A.nombre, A.img, A.grupo, A.dia, A.hora, L.numero AS id_liga FROM alumnos A, ligas L WHERE A.id_liga = L.id AND L.id = ? ORDER BY A.nombre', [idLiga]);
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

        let alumnos = null;

        if (idGrupo == 0){
            [alumnos] = await conexion.query('SELECT * FROM alumnos WHERE id_liga =? ORDER BY nombre', [idLiga]);
        } else {
            const [alumnos] = await conexion.query('SELECT * FROM alumnos WHERE id_liga = ? AND grupo =? ORDER BY nombre', [idLiga, idGrupo]);
        }

        const response =await getCalificacionAlumno(alumnos);

        res.status(200).json(response);

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

const getCalificacionAlumno = async (alumnos) => {
    const finalResult = [];
    for (const alumno of alumnos) {
        try {
            const [result1] = await conexion.query("SELECT SUM(puntos_1) as pts1 FROM encuentros WHERE alumno_1 =?", [alumno.id]);
            const [result2] = await conexion.query("SELECT SUM(puntos_2) as pts2 FROM encuentros WHERE alumno_2 =?", [alumno.id]);

            const pts = parseInt(result1[0].pts1) + parseInt(result2[0].pts2);


            const [result3] = await conexion.query("SELECT * FROM encuentros WHERE puntos_1 > puntos_2 AND alumno_1 =?", [alumno.id]);
            const [result4] = await conexion.query("SELECT * FROM encuentros WHERE puntos_2 > puntos_1 AND alumno_2 =?", [alumno.id]);

            const ganadas = parseInt(result3.length) + parseInt(result4.length);


            const [result5] = await conexion.query("SELECT * FROM encuentros WHERE alumno_1 =?", [alumno.id]);
            const [result6] = await conexion.query("SELECT * FROM encuentros WHERE alumno_2 =?", [alumno.id]);

            const jugadas = parseInt(result5.length) + parseInt(result6.length);


            const [result7] = await conexion.query("SELECT * FROM encuentros WHERE puntos_1 < puntos_2 AND alumno_1 =?", [alumno.id]);
            const [result8] = await conexion.query("SELECT * FROM encuentros WHERE puntos_2 < puntos_1 AND alumno_2 =?", [alumno.id]);

            const perdidas = parseInt(result7.length) + parseInt(result8.length);


            const [result9] = await conexion.query("SELECT * FROM encuentros WHERE puntos_1 = puntos_2 AND alumno_1 =?", [alumno.id]);
            const [result10] = await conexion.query("SELECT * FROM encuentros WHERE puntos_2 = puntos_1 AND alumno_2 =?", [alumno.id]);

            const empatadas = parseInt(result9.length) + parseInt(result10.length);

            finalResult.push({
                nombre: alumno.nombre,
                img:alumno.img,
                total: pts,
                jugadas: jugadas,
                ganadas: ganadas,
                empate: empatadas,
                perdidas: perdidas,
            });

        } catch (error) {
            console.error(error);
        }
    }

    finalResult.sort((a, b) => b.total - a.total);
    return finalResult;
}
