const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const EncriptaditaAyylmao = require("bcrypt");


const app = express();

// Configuración de CORS correcta
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['POST', 'GET',],
  credentials: true
}));

app.use(express.json());

// 🔌 Conexión a la base de datos
const BaseDeDatos = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "Usuarios"
});

//registrar contacto

app.post("/contacto", (req, res) => {
  const { correo, contacto } = req.body;

  const consultaCorreo = "SELECT * FROM usuarios WHERE correo = ?";
  const consultaInsertar = "INSERT INTO contacto (correo, contacto) VALUES (?, ?)";

  // Verificar si el correo existe en la tabla usuarios
  BaseDeDatos.query(consultaCorreo, [correo], (err, resultado) => {
    if (err) {
      console.error("❌ Error al verificar correo:", err);
      return res.status(500).json({ status: "fail", mensaje: "Error al verificar el correo" });
    }

    if (resultado.length === 0) {
      return res.status(404).json({ status: "fail", mensaje: "El correo no está registrado" });
    }

    // Si el correo existe, insertar el contacto
    BaseDeDatos.query(consultaInsertar, [correo, contacto], (err, data) => {
      if (err) {
        console.error("❌ Error al guardar el contacto:", err);
        return res.status(500).json({ status: "fail", mensaje: "Error al guardar el contacto" });
      }

      return res.status(200).json({ status: "ok", mensaje: "Contacto guardado correctamente" });
    });
  });
});







// ✅ Ruta: Registrar
app.post("/registrar", (req, res) => {
  const { nombre, apellidos, correo, fecha, contrasena } = req.body;

  EncriptaditaAyylmao.hash(contrasena, 10)
    .then(hash => {
      const consulta = "INSERT INTO usuarios (nombre, apellido, correo, fecha, contrasena) VALUES (?, ?, ?, ?, ?)";
      const valores = [nombre, apellidos, correo, fecha, hash];

      BaseDeDatos.query(consulta, valores, (err, data) => {
        if (err) {
          console.error("❌ Error MySQL:", err);
          return res.status(500).json({ mensaje: "Error en MySQL", error: err.message });
        }
        return res.status(200).json("Exito, yay!");
      });
    })
    .catch(err => {
      console.error("❌ Error al encriptar:", err);
      return res.status(500).json({ mensaje: "Fallo en la encriptación" });
    });
});

// ✅ Ruta: Acceder

app.post("/acceder", (req, res) => {
  const { correo, contrasena } = req.body;

  const consulta = "SELECT * FROM usuarios WHERE correo = ?";
  BaseDeDatos.query(consulta, [correo], (err, data) => {
    if (err) {
      console.error("❌ Error en login:", err);
      return res.status(500).json("error, llamen a Dios");
    }

    if (data.length > 0) {
      EncriptaditaAyylmao.compare(contrasena, data[0].contrasena)
        .then(coinciden => {
          if (coinciden) {
            return res.status(200).json({ status: "ok", mensaje: "Exito, yay!" });
          } else {
            return res.status(401).json({ status: "fail", mensaje: "Correo o contraseña incorrectos" });
          }
        })
        .catch(err => {
          console.error("❌ Error al comparar:", err);
          return res.status(500).json({ mensaje: "Fallo al verificar contraseña" });
        });
    } else {
      return res.status(401).json({ status: "fail", mensaje: "Correo o contraseña incorrectos" });
    }
  });
});

// ✅ Servidor corriendo
app.listen(8082, () => {
  console.log("conectandose en puerto 8082 el backend y 3001 el frontend");
});
