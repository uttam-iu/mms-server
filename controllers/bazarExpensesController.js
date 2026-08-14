const { BazadExpenseModel } = require("../schemas/bazarExpensesSchema");
const { MemberModel } = require("../schemas/memberSchema");

exports.deleteBazar = async (payload, cb) => {
    try {
        await BazadExpenseModel.deleteOne({ bazarId: payload?.id });

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

exports.getBazarExpenses = async (payload, cb) => {
    try {
        const activeMember = await MemberModel.find({ status: 'active' }).select('-password').lean();
        const expenses = await BazadExpenseModel.find({ year: payload?.year, month: payload?.month }).lean();

        const result = (expenses ||[]).map((ex) => {
            const shopper = activeMember?.find(ec=>ec?.userId === ex?.shopperUserId);
            return {
                ...ex,
                shopper
            }
        });

        cb({
            success: true,
            data: {
                bazarExpenses: result, totalMealNumber: 0, activeMemberMeta: activeMember?.map(ec => {
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
            isError: false,
            error: er
        })
    }
}

exports.createBazarExpense = async (payload, cb) => {
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

        const result = await BazadExpenseModel.findOneAndUpdate(query, payload, options);

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
            isError: false,
            error: er
        })
    }
}

