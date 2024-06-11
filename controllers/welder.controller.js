
import conexion from "../mysql_conector.js";

export const getJornadas = async (req, res) => {
    try {
      let idLiga = req.params.idLiga;
      const idGrupo = req.params.idGrupo;

      if(idLiga && idGrupo){
        if(idLiga == 0) {
          const [result] = await conexion.query('SELECT id FROM ligas WHERE activa = 1');
          idLiga = result[0].id;
        }
        if(idGrupo == 0){
          const [result] = await conexion.query('SELECT id_j, id FROM jornadas WHERE id_liga =? ORDER BY id', [idLiga]);
          res.status(200).json(result);
        } else {
          const [result] = await conexion.query('SELECT id_j, id FROM jornadas WHERE id_liga =? AND id_grupo =? ORDER BY id', [idLiga, idGrupo]);
          res.status(200).json(result);
        }
      } else {
        res.status(200).json([]);
      }

    } catch (error) {
      console.log(error);
      res.status(500).json({
        "mensaje":error
      })
    }
}

export const getPartidos = async (req, res) => {
  try {
    const idJornada = req.params.id;

    // Primero, obtenemos los enfrentamientos
    const [enfrentamientos] = await conexion.query('SELECT * FROM encuentros WHERE id_jornada = ? ORDER BY id', [idJornada]);

    if(enfrentamientos.length > 0) {
      // Creamos una lista de IDs de alumnos que necesitamos obtener
      const alumnoIds = [];
      enfrentamientos.forEach(enf => {
        if (!alumnoIds.includes(enf.alumno_1)) alumnoIds.push(enf.alumno_1);
        if (!alumnoIds.includes(enf.alumno_2)) alumnoIds.push(enf.alumno_2);
      });

      // Obtenemos los datos completos de los alumnos
      const [alumnos] = await conexion.query('SELECT * FROM alumnos WHERE id IN (?)', [alumnoIds]);

      // Creamos un mapa de alumnos por ID para facilitar la búsqueda
      const alumnosMap = {};
      alumnos.forEach(alumno => {
        alumnosMap[alumno.id] = alumno;
      });

      // Reemplazamos los IDs de los alumnos por los datos completos en los enfrentamientos
      const enfrentamientosConAlumnos = enfrentamientos.map(enf => ({
        ...enf,
        alumno_1: alumnosMap[enf.alumno_1],
        alumno_2: alumnosMap[enf.alumno_2]
      }));

      res.status(200).json(enfrentamientosConAlumnos);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      mensaje: error.message
    });
  }
}

export const getAlumnosInicio = async (req, res) => {
  try {
    const idGrupo = req.params.id;
    const result1 = await conexion.query('SELECT id FROM ligas WHERE activa = 1');

    if (idGrupo == 0){
      const [result] = await conexion.query('SELECT * FROM alumnos WHERE id_liga = ?',[result1[0][0].id]);
      res.status(200).json(result);
    } else {
      const [result] = await conexion.query('SELECT * FROM alumnos WHERE id_liga = ? AND grupo = ? ORDER BY nombre', [result1[0][0].id, idGrupo]);
      res.status(200).json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      "mensaje":error
    })
  }
}

export const getGrupos = async (req, res) => {
  try {
    const [result] = await conexion.query('SELECT * FROM grupos ORDER BY nombre');
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      "mensaje":error
    })
  }
}

export const getDatosLiga = async (req, res) => {
  try {
    const [result] = await conexion.query('SELECT id_user, dia_ini, dia_fin FROM ligas WHERE activa = 1');
    const result1 = await conexion.query('SELECT nom_ape FROM users WHERE id = ?', [result[0].id_user]);

    const resp = {
      fecha_ini: result[0].dia_ini,
      fecha_fin: result[0].dia_fin,
      nom_ape: result1[0][0].nom_ape
    }

    res.status(200).json(resp);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      "mensaje": error
    })
  }
}
export const deleteEnfrentamiento = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM encuentros WHERE id = ?';
    await conexion.query(query, [id]);

    res.status(200).json({ message: 'Enfrentamiento eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el enfrentamiento' });
  }
}

export const updateEnfrentamiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { alumno1, alumno2 } = req.body;

    const query = 'UPDATE encuentros SET puntos_1 =?, puntos_2 =? WHERE id =?';
    await conexion.query(query, [alumno1, alumno2, id]);

    res.status(200).json({ message: 'encuentro actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el encuentro' });
  }
}

export const addJornadas = async (req, res) => {
  try {
    const { liga, grupo } = req.body;
    let alumnos;
    if (grupo == 0) {
      [alumnos] = await conexion.query('SELECT id, grupo FROM alumnos WHERE id_liga = ?', [liga]);
    } else {
      [alumnos] = await conexion.query('SELECT id, grupo FROM alumnos WHERE id_liga = ? AND grupo = ?', [liga, grupo]);
    }

    const grupos = alumnos.reduce((acc, alumno) => {
      if (!acc[alumno.grupo]) {
        acc[alumno.grupo] = [];
      }
      acc[alumno.grupo].push(alumno);
      return acc;
    }, {});

    let grupos_2 = [];

    for (const [grupoId, grupoAlumnos] of Object.entries(grupos)) {
        grupos_2.push(generarJornadasYPartidos(grupoId, grupoAlumnos));
    }

    for (const grupo of grupos_2) {

      for (const jornada of grupo){

        const jornadaId = jornada.jornada;
        const grupoId = jornada.grupo;

        const [result1] = await conexion.query('INSERT INTO jornadas (id, id_liga, id_grupo) VALUES (?, ?, ?)', [jornadaId, liga, grupoId]);
        const [result2] = await conexion.query('SELECT MAX(id_j) as id FROM jornadas');
        const idJornada = result2[0]['id'];

        if (result1.affectedRows > 0) {

          for (const partido of jornada.partidos){

            const [result3] =  await conexion.query('INSERT INTO encuentros (alumno_1, alumno_2, dia, hora, id_jornada, puntos_1, puntos_2) VALUES (?, ?, CURDATE(), CURTIME(), ?, NULL, NULL)', [partido.equipo1.id, partido.equipo2.id, idJornada]);

            if (result3.affectedRows === 0) {
              res.status(500).json({ message: 'Error al eliminar el enfrentamiento' });
            }

          }

        } else {
          res.status(500).json({ message: 'Error al eliminar el enfrentamiento' });
        }

      }

    }

    res.status(200).json({ message: 'Enfrentamiento eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el enfrentamiento' });
  }
}


function generarJornadasYPartidos(id_grupo, alumnos) {
  const totalEquipos = alumnos.length;

  // Añadir un equipo ficticio si el número de equipos es impar
  if (totalEquipos % 2 !== 0) {
    alumnos.push({id:0, grupo: 0});
  }

  const totalJornadas = (alumnos.length - 1) * 2;
  const partidosPorJornada = alumnos.length / 2;

  let jornadas = [];

  // Generar las jornadas de ida
  for (let ronda = 0; ronda < alumnos.length - 1; ronda++) {
    let jornada = { jornada: ronda + 1, grupo: id_grupo, partidos: [] };

    for (let i = 0; i < partidosPorJornada; i++) {
      const equipo1 = alumnos[i];
      const equipo2 = alumnos[alumnos.length - 1 - i];
      if (equipo1.id !== 0 && equipo2.id !== 0) {
        jornada.partidos.push({ equipo1, equipo2 });
      }
    }

    jornadas.push(jornada);
    alumnos.splice(1, 0, alumnos.pop());
  }

  // Generar las jornadas de vuelta
  const jornadasDeIda = JSON.parse(JSON.stringify(jornadas)); // Copiar las jornadas de ida

  for (let i = 0; i < jornadasDeIda.length; i++) {
    let jornadaDeVuelta = { jornada: jornadasDeIda.length + i + 1, grupo: id_grupo, partidos: [] };

    for (let partido of jornadasDeIda[i].partidos) {
      jornadaDeVuelta.partidos.push({ equipo1: partido.equipo2, equipo2: partido.equipo1 });
    }

    jornadas.push(jornadaDeVuelta);
  }

  jornadas.forEach(jornada => {
    jornada.partidos = desordenarArray(jornada.partidos);
  });

  return jornadas;
}

function desordenarArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
