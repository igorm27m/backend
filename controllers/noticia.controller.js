
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import conexion from "../mysql_conector.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadPath = path.join(__dirname,'../../src/assets/img/');

export const getNoticias = async (req, res) => {
    try {
        const [result] = await conexion.query('SELECT * FROM noticias ORDER BY dia desc, hora desc');
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "mensaje":error
        })
    }
}

export const addNoticia = async (req, res) => {
    try {
        const { titulo, descripcion } = req.body;
        const userId = req.user.id;
        const imgFile = req.files ? req.files.img : null;
        let imgPath = '';
        let isImage = false, isVideo = false ;
        if (imgFile) {
            const mimeType = imgFile.mimetype;
            isImage = mimeType.startsWith('image/');
            isVideo = mimeType.startsWith('video/');
            imgPath = `${Date.now()}_${imgFile.name}`;
            const savePath = path.join(uploadPath, imgPath);
            imgFile.mv(savePath);
        }

        if(isImage){
            const [result] = await conexion.query('INSERT INTO noticias (id_user, titulo, descripcion, img, dia, hora) VALUES (?,?,?,?, CURDATE(), CURTIME())', [userId, titulo, descripcion, imgPath]);
        } else if(isVideo) {
            const [result] = await conexion.query('INSERT INTO noticias (id_user, titulo, descripcion, video, dia, hora) VALUES (?,?,?,?, CURDATE(), CURTIME())', [userId, titulo, descripcion, imgPath]);
        } else {
            const [result] = await conexion.query('INSERT INTO noticias (id_user, titulo, descripcion, dia, hora) VALUES (?,?,?, CURDATE(), CURTIME())', [userId, titulo, descripcion]);
        }
        res.status(200).json({"mensaje":"ok"});
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "mensaje":error
        })
    }
}

export const updateNoticia = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion } = req.body;
        const imgFile = req.files ? req.files.img : null;

        let imgPath = '';
        let isImage, isVideo ;

        if (imgFile) {
            const mimeType = imgFile.mimetype;
            isImage = mimeType.startsWith('image/');
            isVideo = mimeType.startsWith('video/');

            imgPath = `${Date.now()}_${imgFile.name}`;
            const savePath = path.join(uploadPath, imgPath);
            imgFile.mv(savePath);
        }
        if (imgPath === '') {
            const [result] = await conexion.query('UPDATE noticias SET titulo =?, descripcion =?, dia =CURDATE(), hora =CURTIME() WHERE id =?', [titulo, descripcion, id]);
        } else {
            if(isImage){
                const [result] = await conexion.query('UPDATE noticias SET titulo =?, descripcion =?, img =?, video=NULL, dia =CURDATE(), hora =CURTIME() WHERE id =?', [titulo, descripcion, imgPath, id]);
            } else if(isVideo) {
                const [result] = await conexion.query('UPDATE noticias SET titulo =?, descripcion =?, img=NULL, video =?, dia =CURDATE(), hora =CURTIME() WHERE id =?', [titulo, descripcion, imgPath, id]);
            } else {
                res.status(400).json({"mensaje":"el fichero no es valido"})
            }
        }
        res.status(200).json({ message: 'Alumno actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el alumno' });
    }
}

export const deleteNoticia = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM noticias WHERE id = ?';
        await conexion.query(query, [id]);

        res.status(200).json({ message: 'Noticia eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar la noticia' });
    }
};
