const { BazarExpenseModel } = require("../schemas/bazarExpensesSchema");
const { MealMatrixModel } = require("../schemas/mealMatrixSchema");
const { MemberModel } = require("../schemas/memberSchema");

const populateMonthlyMeal = async (payload) => {
    const year = String(payload?.year || new Date().getFullYear());
    const monthRaw = payload?.month;
    const monthNum = parseInt(monthRaw, 10);
    const month = Number.isNaN(monthNum) ? (new Date().getMonth() + 1) : monthNum; // 1-12

    const activeMembers = await MemberModel.find({ status: 'active' }).select('-password').lean();

    const memberMealsTemplate = {};
    (activeMembers || []).forEach(m => {
        if (m && m.userId) memberMealsTemplate[m.userId] = 0;
    });

    const daysInMonth = new Date(year, month, 0).getDate();

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const mealMatrix = [];
    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(Number(year), month - 1, d);
        // Use Bangladesh timezone (Asia/Dhaka) to derive the date string and weekday
        const dateStr = dateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' }); // YYYY-MM-DD
        const dayName = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', weekday: 'long' }).format(dateObj);
        mealMatrix.push({
            date: dateStr,
            dayName,
            dailyTotalMeals: 0,
            memberMeals: { ...memberMealsTemplate }
        });
    }

    const doc = {
        year: String(year),
        month: monthRaw,
        mealMatrix
    };

    const created = await MealMatrixModel.create(doc);
    return created.toObject ? created.toObject() : created;
}

exports.getMealMatrix = async (payload, cb) => {
    try {
        const allMember = await MemberModel.find().select('-password').lean();
        let result = await MealMatrixModel.findOne({ year: payload?.year, month: payload?.month }).lean();
        if (!result)
            result = await populateMonthlyMeal(payload);


        let members = []
        Object.keys(result?.mealMatrix?.[0]?.memberMeals)?.map(uId => {
            const user = allMember?.find(m => m?.userId === uId);
            members.push({
                label: user?.fullName,
                value: uId
            })
        })

        cb({
            success: true,
            data: {
                dailyMealEntries: result?.mealMatrix || [],
                memberMeta: members
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

exports.updateDailyMeal = async (payload, cb) => {
    try {
        let result = await MealMatrixModel.findOne({ year: payload?.year, month: payload?.month }).lean();
        if (!result) {
            return cb({
                success: false,
                data: null,
                message: 'Meal matrix not found for given month/year',
                isError: true,
                error: null
            });
        }

        const updatedMealMatrix = (result.mealMatrix || []).map(ec => {
            if (ec?.date === payload?.date) {
                return {
                    ...ec,
                    memberMeals: payload?.memberMeals,
                    dailyTotalMeals: Object.values(payload?.memberMeals || {}).reduce((s, v) => s + (Number(v) || 0), 0)
                };
            }
            return ec;
        });

        const params = { mealMatrix: updatedMealMatrix };

        const updatedDoc = await MealMatrixModel.findOneAndUpdate(
            { year: payload?.year, month: payload?.month },
            { $set: params },
            { new: true, runValidators: true }
        ).lean();

        cb({
            success: true,
            data: updatedDoc?.mealMatrix || [],
            message: 'Meal updated.',
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

exports.getMonthlyMealConsumedMembers = async (payload) => {
    const allMember = await MemberModel.find().select('-password').lean();
    const result = await MealMatrixModel.findOne({ year: payload?.year, month: payload?.month }).lean();

    if (!result || !Array.isArray(result.mealMatrix) || result.mealMatrix.length === 0) return [];

    const firstEntry = result.mealMatrix[0];
    const memberMealsEntry = firstEntry?.memberMeals || {};

    // Extract userIds from memberMealsEntry whether it's a plain object or a Map-like structure
    let uIds = [];
    if (memberMealsEntry instanceof Map) {
        uIds = Array.from(memberMealsEntry.keys());
    } else if (memberMealsEntry && typeof memberMealsEntry === 'object') {
        uIds = Object.keys(memberMealsEntry);
    }

    // Fallback: if no uIds found, derive from allMember list
    if ((!uIds || uIds.length === 0) && Array.isArray(allMember) && allMember.length) {
        uIds = allMember.map(m => m.userId).filter(Boolean);
    }

    const members = (uIds || []).map(uId => {
        const user = (allMember || []).find(m => String(m?.userId) === String(uId));
        if (!user) return null;
        return {
            label: user.fullName || '',
            value: uId,
            ...user
        };
    }).filter(Boolean);

    return members;
}

exports.getMonthlyMealConsumedMeal = async (payload) => {
    try {
        const result = await MealMatrixModel.findOne({ year: payload?.year, month: payload?.month }).lean();

        if (!result || !Array.isArray(result?.mealMatrix) || result.mealMatrix.length === 0) {
            return { totalConsumed: 0, memberWiseConsumed: {} };
        }

        let totalConsumed = 0;
        const memberWiseConsumed = {};

        for (const day of result.mealMatrix) {
            // Compute daily total from memberMeals if dailyTotalMeals missing or inconsistent
            let dailySum = 0;
            const memberMeals = day?.memberMeals || {};

            // handle Map-like or plain object
            let keys = [];
            if (memberMeals instanceof Map) keys = Array.from(memberMeals.keys());
            else if (memberMeals && typeof memberMeals === 'object') keys = Object.keys(memberMeals);

            for (const uid of keys) {
                const rawVal = memberMeals instanceof Map ? memberMeals.get(uid) : memberMeals[uid];
                const val = Number(rawVal) || 0;
                dailySum += val;
                memberWiseConsumed[uid] = (memberWiseConsumed[uid] || 0) + val;
            }

            // prefer stored dailyTotalMeals if it's a valid number, otherwise use computed sum
            const storedDaily = Number(day?.dailyTotalMeals);
            totalConsumed += Number.isFinite(storedDaily) && !Number.isNaN(storedDaily) ? storedDaily : dailySum;
        }

        return { totalConsumed, memberWiseConsumed };
    } catch (er) {
        return { totalConsumed: 0, memberWiseConsumed: {}, error: er };
    }
}