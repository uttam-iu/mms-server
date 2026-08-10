
const dotEnv = require('dotenv');
dotEnv.config();

const { serverFormattedDate, serverFormattedDateAndTime, getHassPassword, isPasswordMatch } = require('./helpers/utilities');
const _ = require('lodash');
const jwt = require("jsonwebtoken");
const { v4: uuid } = require('uuid');
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const app = require("./app");

mongoose.connect(MONGO_URI)
  .then((res) => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.log('DB Connection Error: ', err));

const server = app.listen(process.env.PORT, () => {
	console.log(`Server listening on ${process.env.PORT}`);
});

const socketIO = require("socket.io")(server, {
	allowEIO3: true,
	cors: {
		origin: true,
		methods: ['GET', 'POST'],
		credentials: true
	}
});

socketIO.use(async (socket, next) => {
	try {
		const token = socket.handshake.query.token;
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		socket.userId = payload.userId;
		next();
	} catch (err) {

	}
});

socketIO.on('connection', (socket) => {
	socket.on('disconnect', () => {
		console.log(`🔥:${socket?.userId} A user disconnected`);
		socket?.disconnect();
	});
});
