const express = require("express");
const router  = express.Router();
const db      = require("../database");
const jwt     = require("jsonwebtoken");
const bcrypt  = require("bcryptjs");

// Devuelve un error si no hay una sesión activa, OK si la hay
router.get("/logged", (req, res) => {
	if (!req.session.usuario) {
		res.json({logged: false});
		return;
	}

	res.json({logged: true, usuario: req.session.usuario});
});

router.post("/login", (req, res) => {
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
		req.session.usuario = usuario;

		// Si el código llega hasta acá, el usuario existe y la contraseña es correcta
		res.json({usuario: usuario, token: token});
	})
});

// INSERT usuario
router.post("/usuario", (req, res) => {
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

module.exports = router;
