import { getHassPassword } from "../helpers/utilities.js";
import _ from 'lodash';
import { IndividualFixedCostModel } from "../schemas/fixedCostSchema.js";
import { MemberModel, MemberCreateModel } from "../schemas/memberSchema.js";

export const getAllMember = async (payload) => {
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

	let mergedMembers = members;
	if (Array.isArray(members) && members.length) {
		const userIds = members.map(m => m.userId).filter(Boolean);
		if (userIds.length) {
			const costs = await IndividualFixedCostModel.find({ userId: { $in: userIds } }).lean();
			const costsMap = {};
			(costs || []).forEach(c => { costsMap[c.userId] = c; });
			mergedMembers = members.map(m => ({
				...m,
				individualCosts: costsMap[m.userId]?.individualCosts || []
			}));
		}
	}

	return mergedMembers;
}

export const getMembers = async (payload, cb) => {
	try {
		const mergedMembers = await this.getAllMember(payload);

		cb({
			success: true,
			data: mergedMembers,
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
}

export const createMember = async (payload, cb) => {
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
			isError: true,
			error: er
		})
	}
}

export const updateMember = async (payload, cb) => {
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
		cb({
			success: false,
			data: null,
			message: 'Failed',
			isError: true,
			error: er
		})
	}
}

export const updateStatus = async (payload, cb) => {
	try {
		const userId = payload?.userId;
		const params = { status: payload?.isActive? 'active': 'inactive', updatedAt: new Date().toISOString() };
		
		const mem = await MemberModel.findOneAndUpdate(
			{ userId },
			{ $set: params },
			{ new: true, runValidators: true }
		).lean();

		cb({
			success: true,
			data: null,
			message: 'Status updated.',
			isError: false,
			error: null
		});
	} catch (er) {
		cb({
			success: false,
			data: null,
			message: 'Failed',
			isError: true,
			error: er
		})
	}
}