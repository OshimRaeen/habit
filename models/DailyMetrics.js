import mongoose from 'mongoose';

const DailyMetricsSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // "YYYY-MM-DD"
  mood: { type: String, default: '' },
  hoursOfSleep: { type: Number, default: null },
});

export default mongoose.models.DailyMetrics ||
  mongoose.model('DailyMetrics', DailyMetricsSchema);