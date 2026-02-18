const mongoose = require('mongoose');

const foodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  foods: [{
    name: { type: String, required: true },
    brand: String,
    barcode: String,
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'grams' },
    nutrition: {
      calories: { type: Number, required: true },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: Number,
      sugar: Number,
      sodium: Number
    },
    photo: String, // AI-analyzed food photo
    aiConfidence: Number, // AI recognition confidence
    isManualEntry: { type: Boolean, default: false }
  }],
  totalNutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FoodEntry', foodEntrySchema);
