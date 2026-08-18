import { BazarExpenseModel } from "../schemas/bazarExpensesSchema.js";
import { MemberModel } from "../schemas/memberSchema.js";
import { getBazarCost } from "./bazarExpensesController.js";
import { getExtraCost } from "./fixedCostController.js";
import { getMonthlyMealConsumedMeal } from "./mealMatrixController.js";
import _ from 'lodash';
import { getAllMember } from "./memberController.js";

const INITIAL_DATA = {
    totalMeals: 0,
    mealRate: 0,
    totalBazarCost: 0,
    totalExtraCost: 0,
    totalGrossCost: 0,
    totalDeposits: 0,
    cashInHand: 0,
    mealMembers: 0,
    baxarExpensesBreakdown: [],
    extraCostBreakdown: [],
    mealBreakdown: [],
    houseCostBreakdown: [],
    activeMember: []
}

export const getMonthlySummary = async (payload, cb) => {

    try {
        const summary = { ...INITIAL_DATA }
        const memberList = await getAllMember({ year: payload?.year, month: payload?.month });
        const { bazarCost, activeMember } = await getBazarCost(payload);

        const costForIndividualsFixed = (activeMember || []).reduce((acc, aMember) => {
            const uid = aMember?.userId || aMember?.value;
            const fUser = (memberList || []).find(us => String(us?.userId) === String(uid)) || { individualCosts: [] };
            return acc + _.sumBy(fUser.individualCosts || [], 'amount');
        }, 0);

        const consumedMeal = await getMonthlyMealConsumedMeal(payload)
        summary.totalMeals = consumedMeal?.totalConsumed || 0;

        const extraCost = await getExtraCost(payload);
        summary.totalExtraCost = _.sumBy(extraCost, 'amount');


        summary.mealMembers = activeMember?.length || 0;
        summary.totalBazarCost = _.sumBy(bazarCost, 'amount');
        const mealRate = _.sumBy(bazarCost, 'amount') / (consumedMeal?.totalConsumed || 1)
        summary.mealRate = mealRate;

        const houseCost = _.sumBy(bazarCost, 'amount') + _.sumBy(extraCost, 'amount') + costForIndividualsFixed;
        summary.totalGrossCost = houseCost;
        const totalDeposits = _.sumBy(bazarCost, 'amount');
        summary.totalDeposits = totalDeposits;
        summary.cashInHand = totalDeposits - houseCost;
        summary.baxarExpensesBreakdown = bazarCost?.map(ec => {
            return {
                date: ec?.date,
                amount: ec?.amount,
                itemsDescription: ec?.itemsDescription,
                shoppedBy: activeMember?.filter(m => String(m?.userId) === String(ec?.shopperUserId))?.map(us => {
                    return {
                        fullName: us?.fullName,
                        phone: us?.phone,
                        status: us?.status
                    }
                })?.[0]
            }
        });
        summary.extraCostBreakdown = extraCost?.map(ec => {
            return {
                billTitle: ec?.billTitle,
                amount: ec?.amount,
                description: ec?.description,
            }
        });

        summary.mealBreakdown = Object.keys(consumedMeal?.memberWiseConsumed)?.map(ec => {
            const consumedMember = activeMember?.find(m => String(m?.userId) === String(ec))
            return {
                fullName: consumedMember?.fullName,
                phone: consumedMember?.phone,
                meal: consumedMeal?.memberWiseConsumed?.[ec]
            }
        });

        summary.houseCostBreakdown = [
            {
                label: 'Bazar Cost',
                value: _.sumBy(bazarCost, 'amount')
            },
            {
                label: 'Extra Cost(Utilities)',
                value: _.sumBy(extraCost, 'amount')
            },
            {
                label: 'Fixed Cost(All Member)',
                value: costForIndividualsFixed
            }
        ];
        summary.activeMember = activeMember;

        const memberWiseSummary = activeMember?.map(m => {
            const _mealConsumed = consumedMeal?.memberWiseConsumed?.[m?.userId] || 0;
            const _mealCost = (consumedMeal?.memberWiseConsumed?.[m?.userId] || 0) * mealRate;
            const _totalDeposit = _.sumBy(bazarCost?.filter(bz => String(bz?.shopperUserId) === String(m?.userId)), 'amount')
            const _perHeadextraCost =  _.sumBy(extraCost, 'amount') / (activeMember?.length || 1)
            const _individualfixedShare = _.sumBy((memberList || []).find(us => String(us?.userId) === String(m?.userId)) || { individualCosts: [] }?.individualCosts, 'amount');
            return {
                userId: m?.userId,
                fullName: m?.fullName,
                phone: m?.phone,
                status: m?.status,
                mealConsumed: _mealConsumed,
                mealCost: _mealCost,
                perHeadextraCost: _perHeadextraCost,
                totalDeposit: _totalDeposit,
                individualfixedShare: _individualfixedShare,
                grossTotal: _mealCost + _individualfixedShare + _perHeadextraCost,
                netBalance: _totalDeposit - (_mealCost + _individualfixedShare + _perHeadextraCost),
                hasDue: _totalDeposit < (_mealCost + _individualfixedShare + _perHeadextraCost)
            }
        })

        cb({
            success: true,
            data: { summary, memberWiseSummary, year: payload?.year, month: payload?.month },
            message: 'Success',
            isError: false,
            error: null
        })
    } catch (er) {
        cb({
            success: false,
            data: { summary: INITIAL_DATA, memberWiseSummary: [], year: payload?.year, month: payload?.month },
            message: 'Failed',
            isError: true,
            error: er
        })
    }
}
