import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  role: { type: String, enum: ['admin', 'budget_manager', 'approver', 'member', 'viewer'], required: true },
  tokenHash: { type: String, required: true, unique: true, select: false },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  acceptedAt: { type: Date, default: null },
  revokedAt: { type: Date, default: null }
}, { timestamps: true });

invitationSchema.index({ workspace: 1, email: 1, acceptedAt: 1, revokedAt: 1 });
export default mongoose.model('WorkspaceInvitation', invitationSchema);
