const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
	const token = req.header("auth-token");

	if(!token) {
		res.status(401).send("No token.")
	}

	try {
		const decoded = jwt.verify(token, process.env.SECRET);

		req.user_id = decoded.user_id;
		next();
	} catch {
		res.status(201).send("Token inválido");
	}
}
