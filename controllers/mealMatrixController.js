const { BazadExpenseModel } = require("../schemas/bazarExpensesSchema");
const { MealMatrixModel } = require("../schemas/mealMatrixSchema");
const { MemberModel } = require("../schemas/memberSchema");

const populateMonthlyMeal = async (payload) => {
    const year = String(payload?.year || new Date().getFullYear());
    const monthRaw = payload?.month;
    const monthNum = parseInt(monthRaw, 10);
    const month = Number.isNaN(monthNum) ? (new Date().getMonth() + 1) : monthNum; // 1-12

    // get active members
    const activeMembers = await MemberModel.find({ status: 'active' }).select('-password').lean();

    // prepare memberMeals map with 0 for each active member
    const memberMealsTemplate = {};
    (activeMembers || []).forEach(m => {
        if (m && m.userId) memberMealsTemplate[m.userId] = 0;
    });

    // determine days in month
    const daysInMonth = new Date(year, month, 0).getDate();

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const mealMatrix = [];
    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(Number(year), month - 1, d);
        const dateStr = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
        mealMatrix.push({
            date: dateStr,
            dayName: dayNames[dateObj.getDay()],
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
        let result = await MealMatrixModel.findOne({ year: payload?.year, month: payload?.month }).lean();
        if (!result)
            result = await populateMonthlyMeal(payload);

        const allMember = await MemberModel.find().select('-password').lean();

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

// exports.updateDailyMeal = async (payload, cb) => {
//      cb({
//             success: true,
//             data: null,
//             message: 'Meal updated',
//             isError: false,
//             error: null
//         })
//     // try {
//     //     let bazarId = payload?.bazarId;
//     //     if (!bazarId) {
//     //         bazarId = Date.now().toString();
//     //         payload = { ...payload, bazarId };
//     //     }

//     //     const query = { bazarId };

//     //     const options = {
//     //         upsert: true,
//     //         new: true,
//     //         runValidators: true
//     //     };

//     //     const result = await BazadExpenseModel.findOneAndUpdate(query, payload, options);

//     //     cb({
//     //         success: true,
//     //         data: result,
//     //         message: 'Bazar updated.',
//     //         isError: false,
//     //         error: null
//     //     })
//     // } catch (er) {
//     //     cb({
//     //         success: false,
//     //         data: null,
//     //         message: 'Failed',
//     //         isError: false,
//     //         error: er
//     //     })
//     // }
// }

