const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profile: {
    height: { type: Number, required: true }, // in cm
    weight: { type: Number, required: true }, // in kg
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    activityLevel: { 
      type: String, 
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'moderate'
    },
    goal: {
      type: String,
      enum: ['lose_weight', 'maintain_weight', 'gain_weight'],
      default: 'maintain_weight'
    },
    targetWeight: Number,
    dailyCalorieGoal: Number,
    initialBodyPhoto: String, // file path
  },
  bodyPhotos: [{
    photo: String,
    date: { type: Date, default: Date.now },
    analysis: {
      estimatedBodyFat: Number,
      muscleMass: Number,
      notes: String
    }
  }],
  preferences: {
    units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    notifications: {
      mealReminders: { type: Boolean, default: true },
      progressPhotos: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
