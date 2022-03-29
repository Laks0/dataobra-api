const session = require("express-session");

const MemoryStore = session.MemoryStore;

module.exports = session({
	store: new MemoryStore(),
	secret: process.env.SECRET,
	saveUninitialized: false,
	resave: false,
	cookie: {
		secure: process.env.HTTPS === "https",
		httpOnly: true,
		maxAge: 1000 * 60 * 30, // 30 minutos
	},
});
