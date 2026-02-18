// utils/nutritionCalculator.js

function calculateBMR({ weight, height, age, gender }) {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

function calculateDailyCalories({ weight, height, age, gender, activityLevel, goal }) {
  const bmr = calculateBMR({ weight, height, age, gender });

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };

  let calories = bmr * (activityMultipliers[activityLevel] || 1.55);

  if (goal === 'lose_weight') calories -= 500;
  if (goal === 'gain_weight') calories += 500;

  return Math.round(calories);
}

module.exports = { calculateDailyCalories };
