const Redis        = require("ioredis");
const connectRedis = require("connect-redis");
const session      = require("express-session");

const RedisStore = connectRedis(session);
const redisClient = new Redis(
	process.env.REDIS_PORT,
	process.env.REDIS_HOST,
	{password: process.env.REDIS_PASSWORD}
);

module.exports = session({
	store: new RedisStore({ client: redisClient }),
	secret: process.env.SECRET,
	saveUninitialized: false,
	resave: false,
	cookie: {
		secure: process.env.HTTPS === "https",
		httpOnly: true,
		maxAge: 1000 * 60 * 30, // 30 minutos
	},
});
