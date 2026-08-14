const { FixedUtilityModel, IndividualFixedCostModel } = require("../schemas/fixedCostSchema");
const { MemberModel } = require("../schemas/memberSchema");

exports.deleteUtilitiesFixedCost = async (payload, cb) => {
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
            isError: false,
            error: er
        })
    }
}

exports.getUtilitiesFixedCost = async (payload, cb) => {
    try {
        const result = await FixedUtilityModel.find({ year: payload?.year, month: payload?.month }).lean();
        const activeMember = await MemberModel.find({ status: 'active' }).select('-password').lean();

        cb({
            success: true,
            data: { fixedCosts: result, activeMembers: activeMember?.length },
            message: 'Success',
            isError: false,
            error: null
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
}

exports.createExtraExpenses = async (payload, cb) => {
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
            isError: false,
            error: er
        })
    }
}

exports.updateIndividualFixedCost = async (payload, cb) => {
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
            isError: false,
            error: er
        })
    }
}
