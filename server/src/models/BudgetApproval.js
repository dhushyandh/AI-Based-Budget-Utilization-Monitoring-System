import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  action: { type: String, enum: ['submitted', 'approved', 'rejected', 'cancelled'], required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, trim: true, maxlength: 1000, default: '' },
  at: { type: Date, default: Date.now }
}, { _id: false });

const budgetApprovalSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  budget: { type: mongoose.Schema.Types.ObjectId, ref: 'Budget', required: true, index: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  department: { type: String, trim: true, default: 'General' },
  allocatedAmount: { type: Number, required: true, min: 0.01 },
  period: { type: String, default: 'Monthly' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending', index: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  reviewComment: { type: String, trim: true, maxlength: 1000, default: '' },
  history: { type: [reviewSchema], default: [] }
}, { timestamps: true });

budgetApprovalSchema.index({ workspace: 1, status: 1, createdAt: -1 });
budgetApprovalSchema.index({ budget: 1, status: 1 });
export default mongoose.model('BudgetApproval', budgetApprovalSchema);
