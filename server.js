require("dotenv").config();

const jwt          = require("jsonwebtoken");
const bcrypt       = require("bcryptjs");
const express		   = require("express");
const bodyParser   = require("body-parser");
const cors			   = require("cors");
const auth         = require("./middleware/authMiddleware");
const cookieParser = require("cookie-parser");
const sessionMiddleware = require("./middleware/session");

const presupuestoRouter = require("./routes/presupuesto");

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

const whitelist = ["http://localhost:8080"];
const corsOptions = {
	credentials: true,
	origin: (origin, callback) => {
		if (whitelist.includes(origin))
			return callback(null, true);

		callback(new Error("CORS error"));
	},
};
app.use(cors(corsOptions));

app.options("*", cors());

const db = require("./database");

app.use(sessionMiddleware);

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
		req.session.email = usuario.email;

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

app.use("/presupuesto", auth);
app.use("/presupuesto", presupuestoRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Corriendo en puerto ${PORT}`)
});
