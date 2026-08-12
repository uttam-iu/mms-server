
const dotEnv = require('dotenv');
dotEnv.config();
const { serverFormattedDate, serverFormattedDateAndTime, getHassPassword, isPasswordMatch } = require('./helpers/utilities');
const _ = require('lodash');
const jwt = require("jsonwebtoken");
const { v4: uuid } = require('uuid');
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const { MemberCreateModel, MemberModel, MemberUpdateModel } = require('./schemas/memberSchema');

mongoose.connect(MONGO_URI, { dbName: 'mms' })
	.then((res) => console.log('MongoDB Connected Successfully'))
	.catch((err) => console.log('DB Connection Error: ', err));

const app = require("./app");

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
		// socket.userName = user?.userName;
		next();
	} catch (err) {
		console.log('error')
	}
});

socketIO.on('connection', (socket) => {
	console.log(`🔥:${socket?.userId} A user connected`);
	socket.on('disconnect', () => {
		console.log(`🔥:${socket?.userId} A user disconnected`);
		socket?.disconnect();
	});


	socket.on('get_members', async (payload, cb) => {
		try {
			const { searchText, status } = payload || {};
			const filter = {};

			if (typeof status === 'string' && status.trim()) {
				filter.status = status.trim();
			}

			if (typeof searchText === 'string' && searchText.trim()) {
				const regex = new RegExp(_.escapeRegExp(searchText.trim()), 'i');
				filter.$or = [
					{ fullName: regex },
					{ phone: regex },
					{ userName: regex }
				];
			}

			const members = await MemberModel.find(filter).select('-password').lean();

			cb({
				success: true,
				data: members,
				message: 'Members retrieved successfully.',
				isError: false,
				error: null
			});

		} catch (er) {
			cb({
				success: false,
				data: null,
				message: 'Failed to retrieve members.',
				isError: true,
				error: er
			});
		}
	});

	socket.on('member_create', (payload, cb) => {
		try {
			getHassPassword(payload?.password, async (hPass) => {
				const params = { ...payload, password: hPass };
				const newMember = MemberCreateModel(params);
				await newMember?.save();
				cb({
					success: true,
					data: null,
					message: 'Member created.',
					isError: false,
					error: null
				})
			})
		} catch (er) {
			cb({
				success: false,
				data: null,
				message: 'Failed',
				isError: false,
				error: er
			})
		}
	});

	socket.on('member_update', async (payload, cb) => {
		try {
			const userId = payload?.userId;
			if (!userId) {
				return cb({
					success: false,
					data: null,
					message: 'Invalid member.',
					isError: true,
					error: null
				});
			}

			const params = { ...payload, updatedAt: new Date().toISOString() };
			delete params.userId;

			if (params.password) {
				params.password = await new Promise((resolve, reject) => {
					getHassPassword(params.password, (hash) => {
						resolve(hash);
					});
				});
			}

			const mem = await MemberModel.findOneAndUpdate(
				{ userId },
				{ $set: params },
				{ new: true, runValidators: true }
			).lean();

			if (!mem) {
				return cb({
					success: false,
					data: null,
					message: 'Member not found.',
					isError: true,
					error: null
				});
			}

			const { password, ...memberWithoutPassword } = mem;
			cb({
				success: true,
				data: memberWithoutPassword,
				message: 'Member updated.',
				isError: false,
				error: null
			});
		} catch (er) {
			console.log(er)
			cb({
				success: false,
				data: null,
				message: 'Failed',
				isError: false,
				error: er
			})
		}
	});

	socket.on('get_my_profile', async (payload, cb) => {
		try {
			const userId = socket?.userId;
			if (!userId) {
				return cb({
					success: false,
					data: null,
					message: 'Invalid user',
					isError: true,
					error: null
				});
			}

			const matchedUser = await MemberModel.findOne({ userId }).select('-password').lean();
			cb({
				success: true,
				data: matchedUser,
				message: 'Success.',
				isError: false,
				error: null
			});
		} catch (er) {
			cb({
				success: false,
				data: null,
				message: 'Failed to retrieve profile.',
				isError: true,
				error: er
			});
		}
	});

	socket.on('profile_update', async (payload, cb) => {
		try {
			const userId = socket?.userId;
			if (!userId) {
				return cb({
					success: false,
					data: null,
					message: 'Invalid User',
					isError: true,
					error: null
				});
			}

			const params = { ...payload, updatedAt: new Date().toISOString() };
			delete params.userId;

			const mem = await MemberModel.findOneAndUpdate(
				{ userId },
				{ $set: params },
				{ new: true, runValidators: true }
			).lean();

			if (!mem) {
				return cb({
					success: false,
					data: null,
					message: 'Profile not found.',
					isError: true,
					error: null
				});
			}

			const { password, ...memberWithoutPassword } = mem;
			cb({
				success: true,
				data: memberWithoutPassword,
				message: 'Member updated.',
				isError: false,
				error: null
			});
		} catch (er) {
			cb({
				success: false,
				data: null,
				message: 'Failed',
				isError: false,
				error: er
			})
		}
	});

	socket.on('password_change', async (payload, cb) => {
		try {
			const userId = socket?.userId;

			if (!userId) {
				return cb({
					success: false,
					data: null,
					message: 'Invalid User',
					isError: true,
					error: null
				});
			}

			if (payload?.currentPassword === payload?.newPassword) {
				return cb({
					success: false,
					data: null,
					message: 'Same Password',
					isError: true,
					error: null
				});
			}

			if (!payload?.currentPassword || !payload?.newPassword) {
				return cb({
					success: false,
					data: null,
					message: 'Password required',
					isError: true,
					error: null
				});
			}

			const matchedUser = await MemberModel.findOne({ userId }).lean();
			if (!matchedUser) {
				return cb({
					success: false,
					data: null,
					message: 'User not found',
					isError: true,
					error: null
				});
			}

			const isMatched = await new Promise((resolve) => {
				isPasswordMatch(payload?.currentPassword, matchedUser?.password, (res) => {
					resolve(res);
				});
			});

			if (!isMatched) {
				return cb({
					success: false,
					data: null,
					message: 'Enter valid password',
					isError: true,
					error: null
				});
			}

			const newHash = await new Promise((resolve, reject) => {
				getHassPassword(payload?.newPassword, (h) => resolve(h));
			});

			await MemberModel.findOneAndUpdate(
				{ userId },
				{ $set: { password: newHash } },
				{ new: true, runValidators: true }
			).lean();

			cb({
				success: true,
				data: null,
				message: 'Password updated.',
				isError: false,
				error: null
			});


		} catch (er) {
			cb({
				success: false,
				data: null,
				message: 'Failed',
				isError: false,
				error: er
			})
		}
	});

});
