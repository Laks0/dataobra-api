module.exports = function (req, _, next) {
	if (!req.session || !req.session.usuario) {
		const err = new Error("No se encontró una sesión");
		err.statusCode = 401;

		next(err);
	}
	next();
}
