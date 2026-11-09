import mongoose from 'mongoose';
import Workspace from '../models/Workspace.js';

// Workspace context is optional for backward compatibility. New clients send
// X-Workspace-Id; when present it is always verified against active membership.
export default async function workspaceContext(req, res, next) {
  const workspaceId = req.headers['x-workspace-id'];
  if (!workspaceId) return next();
  if (!mongoose.isValidObjectId(workspaceId)) {
    return res.status(400).json({ message: 'Invalid workspace selection' });
  }
  try {
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      status: 'active',
      'members.user': req.userId
    }).select('_id type name currency members').lean();
    if (!workspace) return res.status(404).json({ message: 'Workspace not found or access denied' });
    const membership = workspace.members.find(member => String(member.user) === String(req.userId));
    req.workspaceId = workspace._id;
    req.workspace = { id: String(workspace._id), name: workspace.name, type: workspace.type, currency: workspace.currency };
    req.workspaceRole = membership?.role || 'member';
    next();
  } catch (error) { next(error); }
}

export function workspaceFilter(req) {
  return req.workspaceId ? { workspace: req.workspaceId } : { workspace: { $exists: false } };
}
