const mongoose = require('mongoose');

const fixedCostSchema = mongoose.Schema({
    individualCosts:  [
        {
            id: { type: String, required: true }, 
            costType: { type: String, required: true },
            amount: { type: Number, required: true }
        }
    ],
    userId: { type: String, required: true, default: Date.now()},
    createdAt: { type: String, default: Date.now() },
    updatedAt: { type: String, default: Date.now() },
})

const FixedCostModel = mongoose?.models?.fixedCostSchema || mongoose.model('FixedCost', fixedCostSchema);

module.exports = { FixedCostModel };