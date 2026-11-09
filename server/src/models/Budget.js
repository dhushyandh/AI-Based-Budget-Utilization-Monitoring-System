import mongoose from 'mongoose';
const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  department: { type: String, trim: true, default: 'General', maxlength: 80 },
  allocatedAmount: { type: Number, required: true, min: 0.01 },
  period: { type: String, trim: true, default: 'Monthly' },
  startDate: { type: Date, default: Date.now }
}, { timestamps: true });
budgetSchema.index({ user: 1, createdAt: -1 });
export default mongoose.model('Budget', budgetSchema);
