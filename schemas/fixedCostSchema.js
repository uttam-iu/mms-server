import mongoose from 'mongoose';

const fixedUtilityCostSchema = mongoose.Schema({
    year: { type: String, required: true },
    month: { type: String, required: true },
    billTitle: { type: String, required: true },
    billTitle: { type: String, required: true },
    category: { type: String, required: true},
    amount: { type: Number, required: true },
    description: { type: String },
    billId: { type: String, default: Date.now() }, 
    createdAt: { type: String, default: Date.now() },
    updatedAt: { type: String, default: Date.now() },
})

export const FixedUtilityModel = mongoose?.models?.FixedUtility || mongoose.model('FixedUtility', fixedUtilityCostSchema);


const individualFixedCostSchema = mongoose.Schema({
    individualCosts:  [
        {
            id: { type: String, required: true }, 
            costType: { type: String, required: true },
            amount: { type: Number, required: true }
        }
    ],
    userId: { type: String, required: true},
    createdAt: { type: String, default: Date.now() },
    updatedAt: { type: String, default: Date.now() },
})

export const IndividualFixedCostModel = mongoose?.models?.IndividualFixedCost || mongoose.model('IndividualFixedCost', individualFixedCostSchema);


