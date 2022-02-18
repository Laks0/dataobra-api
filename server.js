const jwt        = require("jsonwebtoken");
const bcrypt     = require("bcryptjs");
const express		 = require("express");
const bodyParser = require("body-parser");
const cors			 = require("cors");
const auth			 = require("./jwsmiddleware");

const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.options("*", cors());

const db = require("./database");

app.get("/", (_, res) => {
	res.json({mensaje: "Hola!"});
});

app.post("/login", (req, res) => {
	db.query(`SELECT * FROM ${process.env.DB}.usuario WHERE email="${req.body.email}";`, (err, rows) => {
		if (err) {
			res.status(500).send(err);
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

		let token = jwt.sign({user_id: usuario.u_id}, process.env.SECRET, {expiresIn: "1d"});

		// Si el código llega hasta acá, el usuario existe y la contraseña es correcta
		res.json({usuario: usuario, token: token});
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

		let token = jwt.sign({user_id: row.insertId}, process.env.SECRET, {expiresIn: "1d"});
		res.json(token);
	});
});

// POST /presupuesto crea un presupuesto vacío para un usuario por id
app.post("/presupuesto", auth, (req, res) => {
	db.query(`INSERT INTO ${process.env.DB}.presupuesto (nombre, tabla, user_id) VALUES ("${req.body.nombre}", "[]", ${req.body.user_id});`,
	(err, row) => {
		if (err) {
			console.error(err);
			return;
		}

		res.json(row);
	});
});

app.delete("/presupuesto/:pid", auth, (req, res) => {
	console.log(req.params.pid);
	db.query(`DELETE FROM ${process.env.DB}.presupuesto WHERE (p_id='${req.params.pid}');`, (err, rows) => {
		if (err) {
			res.status(500).send(err);
			return;
		}

		res.json(rows);
	});
});

app.get("/presupuesto/:uid", auth, (req, res) => {
	db.query(`SELECT * FROM ${process.env.DB}.presupuesto WHERE user_id=${req.params.uid};`, (err, rows) => {
		if (err) {
			res.status(500).send(err);
			return;
		}

		res.json(rows);
	});
});

app.put("/presupuesto", auth, (req, res) => {
	db.query(`UPDATE ${process.env.DB}.presupuesto SET total = '${req.body.total}', tabla = '${req.body.tabla}' WHERE p_id = ${req.body.p_id};`, (err, row) => {
		if (err) {
			res.status(500).send(err);
			return;
		}

		res.json(row);
	});
});

require("dotenv").config();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Corriendo en puerto ${PORT}`)
});
