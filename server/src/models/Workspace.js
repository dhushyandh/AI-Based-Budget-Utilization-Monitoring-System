import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'budget_manager', 'approver', 'member', 'viewer'], default: 'member' },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  type: { type: String, enum: ['personal', 'organization'], required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  members: { type: [memberSchema], default: [] },
  currency: { type: String, default: 'INR', uppercase: true, match: /^[A-Z]{3}$/ },
  status: { type: String, enum: ['active', 'archived'], default: 'active' }
}, { timestamps: true });

workspaceSchema.index({ 'members.user': 1, status: 1, updatedAt: -1 });
workspaceSchema.index({ owner: 1, type: 1 });
export default mongoose.model('Workspace', workspaceSchema);
