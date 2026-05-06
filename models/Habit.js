import mongoose from 'mongoose';

const HabitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: '✅' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Habit || mongoose.model('Habit', HabitSchema);