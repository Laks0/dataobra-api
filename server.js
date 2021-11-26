const bcrypt = require("bcryptjs");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./database");

app.get("/", (_, res) => {
	res.json({mensaje: "Hola!"});
});

app.post("/login", (req, res) => {
	db.query(`SELECT * FROM ${process.env.DB}.usuario WHERE email="${req.body.email}";`, (err, rows) => {
		if (err) {
			console.error(err);
			return;
		}

		if (rows.length == 0) {
			res.status(400).send("No existe un usuario con ese correo");
			return;
		}

		let usuario = rows[0];
		// Bcrypt compara el hash de la base de datos con la contraseña del query
		if (!bcrypt.compareSync(req.body.contraseña, usuario.contraseña)) {
			res.status(400).send("Contraseña incorrecta");
			return;
		}

		// Si el código llega hasta acá, el usuario existe y la contraseña es correcta
		res.json(usuario);
	})
});

// POST /presupuesto crea un presupuesto vacío para un usuario por id
app.post("/presupuesto", (req, res) => {
	db.query(`INSERT INTO ${process.env.DB}.presupuesto (nombre, tabla, user_id) VALUES ("${req.body.nombre}", "[]", ${req.body.user_id});`,
	(err, row) => {
		if (err) {
			console.error(err);
			return;
		}

		res.json(row);
	});
});

app.get("/presupuesto/:uid", (req, res) => {
	db.query(`SELECT * FROM ${process.env.DB}.presupuesto WHERE user_id=${req.params.uid};`, (err, rows) => {
		if (err) {
			console.error(err);
			return;
		}

		res.json(rows);
	});
});

require("dotenv").config();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Corriendo en puerto ${PORT}`)
});
