const express = require("express");
const router  = express.Router();
const db      = require("../database");

// POST /presupuesto crea un presupuesto vacío para un usuario por id
router.post("/", (req, res) => {
	db.query(`INSERT INTO ${process.env.DB}.presupuesto (nombre, tabla, static_data, user_id) VALUES ("${req.body.nombre}", "[]", "{}", ${req.body.user_id});`,
	(err, row) => {
		if (err) {
			res.status(500).send(err);
			return;
		}

		res.json(row);
	});
});

router.delete("/:pid", (req, res) => {
	db.query(`DELETE FROM ${process.env.DB}.presupuesto WHERE (p_id='${req.params.pid}');`, (err, rows) => {
		if (err) {
			res.status(500).send(err);
			return;
		}

		res.json(rows);
	});
});

router.get("/userid/:uid", (req, res) => {
	db.query(`SELECT * FROM ${process.env.DB}.presupuesto WHERE user_id=${req.params.uid};`, (err, rows) => {
		if (err) {
			res.status(500).send(err);
			return;
		}

		res.json(rows);
	});
});

router.get("/presid/:pid", (req, res) => {
	db.query(`SELECT * FROM ${process.env.DB}.presupuesto WHERE p_id=${req.params.pid}`, (err, rows) => {
		if (err) {
			res.status(500).send(err);
			return;
		}

		res.json(rows);
	});
});

router.put("/", (req, res) => {
	console.log(req.body);
	db.query(`UPDATE ${process.env.DB}.presupuesto SET total = '${req.body.total}', tabla = '${req.body.tabla}', static_data = '${req.body.static_data}' WHERE p_id = ${req.body.p_id};`, (err, row) => {
		if (err) {
			res.status(500).send(err);
			return;
		}

		res.json(row);
	});
});

module.exports = router;
