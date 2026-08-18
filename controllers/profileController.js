import { getHassPassword, isPasswordMatch } from "../helpers/utilities.js";
import { IndividualFixedCostModel } from "../schemas/fixedCostSchema.js";
import { MemberModel } from "../schemas/memberSchema.js";

export const getMyProfile = async (socket, payload, cb) => {
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
        const costs =await IndividualFixedCostModel.findOne({ userId }).lean();
        cb({
            success: true,
            data: { ...matchedUser, individualCosts: costs?.individualCosts || [] },
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
}

export const updateMyProfile = async (payload, cb) => {
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
            isError: true,
            error: er
        })
    }
}

export const changeMyPassword = async (payload, cb) => {
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
            isError: true,
            error: er
        })
    }
}