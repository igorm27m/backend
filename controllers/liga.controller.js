
import conexion from "../mysql_conector.js";

export const getLigas = async (req, res) => {
  try {
    // throw new Error(); // provocar un error
    const [result] = await conexion.query('SELECT * FROM ligas ORDER BY dia_ini desc');
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      "mensaje":error
    })
  }
}

export const getLiga = async (req, res) => {
  try {
    const [result] = await conexion.query('SELECT * FROM ligas WHERE activa = 1');
    res.status(200).json(result[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      "mensaje":error
    })
  }
}

export const addLiga = async(req, res)=>{
  try {
    const {numero, fecha_ini, fecha_fin, activa}=req.body;
    const userId = req.user.id; // Obtener la ID del usuario desde el token

    const [result]=await conexion.query("INSERT INTO ligas (dia_ini, hora_ini, dia_fin, hora_fin, numero, id_user, activa) VALUES (?, CURTIME(), ?, CURTIME(), ?, ?, ?)", [fecha_ini, fecha_fin, numero, userId, activa]);

    res.status(200).json({id:result.insertId});
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message:"Error en el servidor"
    })
  }
}

export const deleteLiga = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM ligas WHERE id = ?';
    await conexion.query(query, [id]);

    res.status(200).json({ message: 'Liga eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la liga' });
  }
};

export const updateLiga = async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, fecha_ini, fecha_fin, activa } = req.body;

    if(activa == 1){
      const [result]=await conexion.query("UPDATE ligas SET activa = 0");
    }

    const query = 'UPDATE ligas SET numero =?, dia_ini =?, dia_fin =? , activa =? WHERE id =?';
    await conexion.query(query, [numero, fecha_ini, fecha_fin, activa, id]);


    res.status(200).json({ message: 'Liga actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la liga' });
  }
}
