const express = require("express");
const router  = express.Router();
const db      = require("../database");

// Todos los endpoints van en /presupuesto

// POST agrega un contribuidor a un presupuseto
// toma presupuesto_id y user_id en el body
router.post("/", (req, res) => {
	db.query(`INSERT INTO ${process.env.DB}.contribuidores (presupuesto_id, user_id) VALUES (${req.body.presupuesto_id}, ${req.body.user_id});`, (err,row) => {
		if (err) {
			res.status(500).send(err);
			return;
		}

		res.json(row);
	});
});

// GET devuelve todas las relaciones de un presupuesto
router.get("/:p_id", (req, res) => {
	db.query(`SELECT Usuario.u_id, Usuario.nombre, Usuario.email, Contribuidores.permiso_edicion
	FROM ${process.env.DB}.contribuidores
	INNER JOIN ${process.env.DB}.usuario ON contribuidores.user_id = usuario.u_id AND contribuidores.presupuesto_id = ${req.params.p_id}`, (err, rows) => {
		if (err) {
			res.status(500).send(err);
			return;
		}

		res.json(rows);
	});
});

// GET /userid/:u_id devuelve todas las relaciones de un usuario
router.get("/userid/:u_id", (req, res) => {
	db.query(`SELECT * FROM ${process.env.DB}.contribuidores WHERE user_id=${req.params.u_id};`, (err, rows) => {
		if (err) {
			res.status(500).send(err);
			return;
		}

		res.json(rows);
	});
});

// DELETE
router.delete("/:c_id", (req, res) => {
	db.query(`DELETE FROM ${process.env.DB}.contribuidores WHERE (c_id='${req.params.c_id}');`, (err, rows) => {
		if (err) {
			res.status(500).send(err);
			return;
		}

		res.json(rows);
	});
});

// PUT edita una relación
// toma c_id, permiso_edicion, user_id
router.put("/", (req, res) => {
	db.query(`UPDATE ${process.env.DB}.contribuidores SET permiso_edicion = '${req.body.permiso_edicion}', user_id = '${req.body.user_id}' WHERE c_id = '${req.body.c_id}';`, (err, row) => {
		if (err) {
			res.status(500).send(err);
			return;
		}

		res.json(row);
	});
});

module.exports = router;
