const cors = require("cors");

const whitelist = ["https://localhost:8080", "https://dataobra-presupuesto.herokuapp.com"];
const corsOptions = {
	credentials: true,
	origin: (origin, callback) => {
		if (whitelist.includes(origin))
			return callback(null, true);

		//callback(new Error("CORS error"));
		callback(null, true);
	},
};

module.exports = cors(corsOptions);
