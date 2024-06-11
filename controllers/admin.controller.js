import conexion from "../mysql_conector.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from "dotenv";
config();

export const getLogin = async (req, res) => {
  try {
    // throw new Error(); // provocar un error
    const {user, pass} = req.body;

    const [result] = await conexion.query(`SELECT * FROM users WHERE nombre = '${user}'`);

    if(result.length == 0) {
      res.status(404).json({
        "mensaje":"Usuario o contraseña no valido"
      })
    } else {
      const user = result[0];
      const validPass = bcrypt.compareSync(pass, user.pass);

      if(!validPass) {
        res.status(404).json({
          "mensaje":"Usuario o contraseña no valido"
        })
      } else {
        const token = jwt.sign({id: user.id}, process.env.SECRET_KEY, {expiresIn: 7200});

        res.status(200).json({
          auth: true,
          token,
          "mensaje":"Login correctamente"
        })
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      "mensaje":error
    })
  }
}

export const getVerifyToken = async (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.status(401).send({ valid: false });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ valid: false });
    }

    res.send({ valid: true });
  });
}
