import dns from 'node:dns';
import dotenv from 'dotenv';
dotenv.config();
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import {parseCookie} from 'cookie';
import mongoose from 'mongoose';

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4'])

// import app from "./app";
// import { deleteUtilitiesFixedCost, getUtilitiesFixedCost, createExtraExpenses, updateIndividualFixedCost } from './controllers/fixedCostController'
import { deleteUtilitiesFixedCost, getUtilitiesFixedCost, createExtraExpenses, updateIndividualFixedCost } from './controllers/fixedCostController.js';
import { getMyProfile, updateMyProfile, changeMyPassword } from './controllers/profileController.js'
import { getMembers, createMember, updateMember, updateStatus } from './controllers/memberController.js'
import { deleteBazar, getBazarExpenses, createBazarExpense } from './controllers/bazarExpensesController.js'
import { getMealMatrix, updateDailyMeal } from './controllers/mealMatrixController.js'
import { getMonthlySummary } from './controllers/summaryController.js'


const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup Cross Origin
app.use(cors({ origin: process.env.FRONT_END_URL, credentials: true }));

const server = httpServer.listen(process.env.PORT, () => {
	console.log(`Server listening on ${process.env.BACK_END_URL}`);
});

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { dbName: 'mms' })
	.then((res) => console.log('MongoDB Connected Successfully'))
	.catch((err) => console.log('DB Connection Error: ', err));


app.get('/', (req, res) => {
  res.send('Hello from Express and MongoDB!');
});

//Setup Error Handlers
import {catchErrors, developmentErrors,notFound,productionErrors} from './handlers/errorHandlers.js'
import { login, logout } from './controllers/userController.js';

app.post("/user/login", catchErrors(login));
app.post("/user/logout", catchErrors(logout));
app.use(notFound);

if (process.env.NODE_ENV === "development") {
  app.use(developmentErrors);
} else {
  app.use(productionErrors);
}

const socketIO = new Server(httpServer, {
	allowEIO3: true,
	cors: {
		origin:  process.env.FRONT_END_URL,
		methods: ['GET', 'POST'],
		credentials: true
	}
});

socketIO.use(async (socket, next) => {
  try {
    const reqCookies = socket.handshake.headers.cookie;
    
    if (!reqCookies) {
      console.log('❌ No cookies found in handshake headers');
      return next(new Error('No cookies found'));
    }

    // cookie.parse ব্যবহার করা হয়েছে
    const parsedCookies = parseCookie(reqCookies);
    const token = parsedCookies.auth_token;

    if (!token) {
      console.log('❌ auth_token cookie is missing');
      return next(new Error('Token missing'));
    }

    // JWT ভেরিফিকেশন
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('❌ JWT Verification Failed:', err.message);
        return next(new Error(`Invalid token: ${err.message}`));
      }

      console.log('✅ Token Verified Successfully for:', decoded.userId);
      socket.userId = decoded.userId; 
      socket.user = decoded; 
      next();
    });

  } catch (err) {
    console.error('❌ Middleware Error:', err);
    return next(new Error('Internal authentication error'));
  }
});

// socketIO.use(async (socket, next) => {
// 	try {
// 		const token = socket.handshake.auth.token;
// 		const user = jwt.verify(token, process.env.JWT_SECRET);
// 		socket.userId = user?.userId;
// 		next();
// 	} catch (err) {
// 		console.log('error', err)
// 	}
// });

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

	socket.on('member_status_update', async (payload, cb) => {
		updateStatus(payload, cb)
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

	socket.on('meal_matrix_update', async (payload, cb) => {
		updateDailyMeal(payload, cb)

	});
	socket.on('monthly_summary', async (payload, cb) => {
		getMonthlySummary(payload, cb)
	});

});
