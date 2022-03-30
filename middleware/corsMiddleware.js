const cors = require("cors");

const whitelist = ["http://localhost:8080"];
const corsOptions = {
	credentials: true,
	origin: (origin, callback) => {
		if (whitelist.includes(origin))
			return callback(null, true);

		callback(new Error("CORS error"));
	},
};

module.exports = cors(corsOptions);
