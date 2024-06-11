
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import conexion from "../mysql_conector.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadPath = path.join(__dirname,'../../src/assets/img/');

export const getPatrocinadores = async (req, res) => {
    try {
        const [result] = await conexion.query('SELECT * FROM patrocinadores ORDER BY nombre');
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "mensaje":error
        })
    }
}

export const addPatrocinador = async (req, res) => {
  try {
      const { nombre, link } = req.body;
      const imgFile = req.files ? req.files.img : null;
      const userId = req.user.id;

      let imgPath = '';
      if (imgFile) {
          imgPath = `${Date.now()}_${imgFile.name}`;
          const savePath = path.join(uploadPath, imgPath);
          imgFile.mv(savePath);
      }

    const [result] = await conexion.query('INSERT INTO patrocinadores (id_user, nombre, link, img, dia, hora) VALUES (?, ?, ?, ?, CURDATE(), CURTIME())', [userId, nombre, link, imgPath]);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      "mensaje":error
    })
  }
}

export const updatePatrocinador = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, link } = req.body;
        const imgFile = req.files ? req.files.img : null;

        let imgPath = '';
        if (imgFile) {
            imgPath = `${Date.now()}_${imgFile.name}`;
            const savePath = path.join(uploadPath, imgPath);
            imgFile.mv(savePath);
        }
        if (imgPath === '') {
            const [result] = await conexion.query('UPDATE patrocinadores SET nombre =?, link =? WHERE id =?', [nombre, link, id]);
        } else {
            const [result] = await conexion.query('UPDATE patrocinadores SET nombre =?, img =?, link =? WHERE id =?', [nombre, imgPath, link, id]);
        }

        res.status(200).json({ message: 'Patrocinador actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el patrocinador' });
    }
}

export const deletePatrocinador = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM patrocinadores WHERE id = ?';
        await conexion.query(query, [id]);

        res.status(200).json({ message: 'Patrocinador eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el Patrocinador' });
    }
};
