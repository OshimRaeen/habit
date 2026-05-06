import mongoose from 'mongoose';

const DailyLogSchema = new mongoose.Schema({
  date: { type: String, required: true },       // "YYYY-MM-DD"
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
  },
  completed: { type: Boolean, default: false },
});

DailyLogSchema.index({ date: 1, habitId: 1 }, { unique: true });

export default mongoose.models.DailyLog || mongoose.model('DailyLog', DailyLogSchema);