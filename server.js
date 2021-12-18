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

// INSERT usuario
app.post("/usuario", (req, res) => {
	let contraseña = bcrypt.hashSync(req.body.contraseña, 10);
	db.query(`INSERT INTO ${process.env.DB}.usuario (nombre, email, contraseña) VALUES ("${req.body.nombre}", "${req.body.email}", "${contraseña}");`, (err, row) => {
		if (err) {
			res.status(500).send(err);
			return;
		}

		res.json(row);
	});
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
			res.status(500).send(err);
			return;
		}

		res.json(rows);
	});
});

app.put("/presupuesto", (req, res) => {
	db.query(`UPDATE ${process.env.DB}.presupuesto SET total = '${req.body.total}', tabla = '${req.body.tabla}' WHERE p_id = ${req.body.p_id};`, (err, row) => {
		if (err) {
			res.status(500).send(err);
			return;
		}

		res.json(row);
	});
});

app.post("/archivo", (req, res) => {
	console.log(req);
	res.send(req.body);
})

require("dotenv").config();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Corriendo en puerto ${PORT}`)
});
