const mongoose = require('mongoose');


const mealMatrixSchema = mongoose.Schema({
    year: { type: String, required: true },
    month: { type: String, required: true },
    mealMatrix: [
        {
            date: { type: String, required: true },
            dayName: { type: String, required: true },
            dailyTotalMeals: { type: Number },
            memberMeals: {
                type: Map,
                of: Number
            }
        }
    ]
})

const MealMatrixModel = mongoose?.models?.MealMatrix || mongoose.model('MealMatrix', mealMatrixSchema);

module.exports = { MealMatrixModel };