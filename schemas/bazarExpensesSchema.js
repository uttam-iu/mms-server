const mongoose = require('mongoose');

const bazarExpensesSchema = mongoose.Schema({
    bazarId: { type: String, default: Date.now() }, 
    shopperUserId: { type: String, required: true },
    date: { type: String, required:true }, 
    amount: { type: Number, required: true },
    category: { type: String, required: true},
    itemsDescription: { type: String, required: true},
    year: { type: String, required: true },
    month: { type: String, required: true },
    createdAt: { type: String, default: Date.now() },
    updatedAt: { type: String, default: Date.now() },
})

const BazadExpenseModel = mongoose?.models?.BazadExpense || mongoose.model('BazadExpense', bazarExpensesSchema);

module.exports = { BazadExpenseModel};