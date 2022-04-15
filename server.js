require("dotenv").config();

const express		        = require("express");
const bodyParser        = require("body-parser");
const auth              = require("./middleware/authMiddleware");
const cookieParser      = require("cookie-parser");
const corsMiddleware    = require("./middleware/corsMiddleware");
const sessionMiddleware = require("./middleware/session");

const presupuestoRouter = require("./routes/presupuesto");
const authRouter        = require("./routes/authRoutes");

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(corsMiddleware);

app.enable("trust proxy");
app.use(sessionMiddleware);

app.use("/", authRouter);

app.use("/presupuesto", auth);
app.use("/presupuesto", presupuestoRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Corriendo en puerto ${PORT}`)
});
