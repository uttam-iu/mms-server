import { BazarExpenseModel } from "../schemas/bazarExpensesSchema.js";
import { MemberModel } from "../schemas/memberSchema.js";
import { getMonthlyMealConsumedMembers } from "./mealMatrixController.js";

export const deleteBazar = async (payload, cb) => {
    try {
        await BazarExpenseModel.deleteOne({ bazarId: payload?.id });

        cb({
            success: true,
            data: null,
            message: 'Deleted',
            isError: false,
            error: null
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

export const getBazarCost = async (payload) => {
        const activeMember = await getMonthlyMealConsumedMembers(payload);
    const expenses = await BazarExpenseModel.find({ year: payload?.year, month: payload?.month }).lean();
    const result = (expenses || []).map((ex) => {
        const shopper = activeMember?.find(ec => ec?.userId === ex?.shopperUserId);
        return {
            ...ex,
            shopper
        }
    });
    return {bazarCost: result, activeMember};
}

export const getBazarExpenses = async (payload, cb) => {
    try {
        const {bazarCost,activeMember } = await this.getBazarCost(payload)

        cb({
            success: true,
            data: {
                bazarExpenses: bazarCost, totalMealNumber: 0, activeMemberMeta: activeMember?.map(ec => {
                    return {
                        label: ec?.fullName,
                        value: ec?.userId
                    }
                })
            },
            message: 'Success',
            isError: false,
            error: null
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

export const createBazarExpense = async (payload, cb) => {
    try {
        let bazarId = payload?.bazarId;
        if (!bazarId) {
            bazarId = Date.now().toString();
            payload = { ...payload, bazarId };
        }

        const query = { bazarId };

        const options = {
            upsert: true,
            new: true,
            runValidators: true
        };

        const result = await BazarExpenseModel.findOneAndUpdate(query, payload, options);

        cb({
            success: true,
            data: result,
            message: 'Bazar updated.',
            isError: false,
            error: null
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

