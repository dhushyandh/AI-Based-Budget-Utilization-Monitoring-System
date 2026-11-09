import mongoose from 'mongoose';
const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', index: true },
  budget: { type: mongoose.Schema.Types.ObjectId, ref: 'Budget', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, required: true, trim: true, maxlength: 60 },
  amount: { type: Number, required: true, min: 0.01 },
  description: { type: String, trim: true, maxlength: 500 },
  date: { type: Date, required: true, default: Date.now }
}, { timestamps: true });
expenseSchema.index({ user: 1, workspace: 1, date: -1 });
export default mongoose.model('Expense', expenseSchema);
