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

app.get("/usuario/:email", (req, res) => {
	db.query(`SELECT * FROM ${process.env.DB_DATABASE}.usuario WHERE email="${req.params.email}"`, (err, rows) => {
		if (err) {
			console.error(err);
			return;
		}

		res.json(rows.length >= 1 ? rows[0] : null);
	})
});

require("dotenv").config();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Corriendo en puerto ${PORT}`)
});
