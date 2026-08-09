
const { serverFormattedDate, serverFormattedDateAndTime, getHassPassword, isPasswordMatch } = require('./helpers/utilities');
const _ = require('lodash');
const jwt = require("jsonwebtoken");
const { v4: uuid } = require('uuid');

const app = require("./app");
const dotEnv = require('dotenv');
dotEnv.config();


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
