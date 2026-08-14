
const dotEnv = require('dotenv');
dotEnv.config();
const { serverFormattedDate, serverFormattedDateAndTime, getHassPassword, isPasswordMatch } = require('./helpers/utilities');
const _ = require('lodash');
const jwt = require("jsonwebtoken");
const { v4: uuid } = require('uuid');
const mongoose = require('mongoose');
const { deleteUtilitiesFixedCost, getUtilitiesFixedCost, createExtraExpenses, updateIndividualFixedCost } = require('./controllers/fixedCostController');
const { getMyProfile, updateMyProfile, changeMyPassword } = require('./controllers/profileController');
const { getMembers, createMember, updateMember } = require('./controllers/memberController');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { dbName: 'mms' })
	.then((res) => console.log('MongoDB Connected Successfully'))
	.catch((err) => console.log('DB Connection Error: ', err));

const app = require("./app");
const { deleteBazar, getBazarExpenses, createBazarExpense } = require('./controllers/bazarExpensesController');
const { getMealMatrix } = require('./controllers/mealMatrixController');

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
		const token = socket.handshake.auth.token;
		const user = jwt.verify(token, process.env.JWT_SECRET);
		socket.userId = user?.userId;
		next();
	} catch (err) {
		console.log('error')
	}
});

socketIO.on('connection', (socket) => {
	console.log(`${socket?.id} A user connected`);
	socket.on('disconnect', () => {
		console.log(`${socket?.id} A user disconnected`);
		socket?.disconnect();
	});

	socket.onAny((eventName, ...args) => {
		console.log(`event name: "${eventName}"`);
		console.log("Arguments:", args);
	});

	socket.on('get_members', async (payload, cb) => {
		getMembers(payload, cb)
	});

	socket.on('member_create', (payload, cb) => {
		createMember(payload, cb)
	});

	socket.on('member_update', async (payload, cb) => {
		updateMember(payload, cb)
	});

	socket.on('get_my_profile', async (payload, cb) => {
		getMyProfile(socket, payload, cb)
	});

	socket.on('profile_update', async (payload, cb) => {
		updateMyProfile(payload, cb)
	});

	socket.on('password_change', async (payload, cb) => {
		changeMyPassword(payload, cb)
	});

	socket.on('member_individual_fixed_cost_update', async (payload, cb) => {
		updateIndividualFixedCost(payload, cb)
	});

	socket.on('fixed_utility_cost_create', async (payload, cb) => {
		createExtraExpenses(payload, cb)
	});

	socket.on('fixed_utility_cost', async (payload, cb) => {
		getUtilitiesFixedCost(payload, cb)
	});

	socket.on('delete_utility_cost', async (payload, cb) => {
		deleteUtilitiesFixedCost(payload, cb)
	});


	socket.on('bazar_expense_update', async (payload, cb) => {
		createBazarExpense(payload, cb)
	});

	socket.on('bazar_expenses', async (payload, cb) => {
		getBazarExpenses(payload, cb)
	});

	socket.on('delete_bazar_expense', async (payload, cb) => {
		deleteBazar(payload, cb)
	});

	socket.on('meal_matrix', async (payload, cb) => {
		getMealMatrix(payload, cb)
	});

});
