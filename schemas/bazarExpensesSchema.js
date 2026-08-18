import mongoose from 'mongoose';

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

export const BazarExpenseModel = mongoose?.models?.BazarExpense || mongoose.model('BazarExpense', bazarExpensesSchema);
