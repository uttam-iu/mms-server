import { FixedUtilityModel, IndividualFixedCostModel } from "../schemas/fixedCostSchema.js";
import { MemberModel } from "../schemas/memberSchema.js";
import { getMonthlyMealConsumedMembers } from "./mealMatrixController.js";

export const deleteUtilitiesFixedCost = async (payload, cb) => {
    try {
        await FixedUtilityModel.deleteOne({ billId: payload?.id });

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

export const getExtraCost = async(payload)=>{
    const extraCost = await FixedUtilityModel.find({ year: payload?.year, month: payload?.month }).lean();
    return extraCost;
}

export const getUtilitiesFixedCost = async (payload, cb) => {
    console.log('called')
    try {
        const extraCost = await this.getExtraCost(payload);
        console.log(extraCost)
        const activeMember = await getMonthlyMealConsumedMembers(payload)
        cb({
            success: true,
            data: { fixedCosts: extraCost, activeMembers: activeMember?.length || 0 },
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

export const createExtraExpenses = async (payload, cb) => {
    try {
        let billId = payload?.billId;
        if (!billId) {
            billId = Date.now().toString();
            payload = { ...payload, billId };
        }

        const query = { billId };

        const options = {
            upsert: true,
            new: true,
            runValidators: true
        };

        const result = await FixedUtilityModel.findOneAndUpdate(query, payload, options);

        cb({
            success: true,
            data: result,
            message: 'Fixed cost updated.',
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

export const updateIndividualFixedCost = async (payload, cb) => {
    try {
        const query = { userId: payload?.userId };
        const options = {
            upsert: true,
            new: true,
            runValidators: true
        };

        const result = await IndividualFixedCostModel.findOneAndUpdate(query, payload, options)

        cb({
            success: true,
            data: result,
            message: 'Fixed cost updated.',
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
