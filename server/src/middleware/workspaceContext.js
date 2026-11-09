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
  return req.workspaceId ? { workspace: req.workspaceId } : {};
}

// In a selected shared workspace, all active members operate on the shared
// workspace ledger. Without a workspace header, preserve legacy user scoping.
export function tenantFilter(req) {
  return req.workspaceId ? { workspace: req.workspaceId } : { user: req.userId };
}

const permissions = {
  owner: ['workspace:manage', 'members:manage', 'budgets:write', 'expenses:write'],
  admin: ['members:manage', 'budgets:write', 'expenses:write'],
  budget_manager: ['budgets:write', 'expenses:write'],
  approver: ['expenses:write'],
  member: ['expenses:write'],
  viewer: []
};

export function requireWorkspacePermission(permission) {
  return (req, res, next) => {
    if (!req.workspaceId) return next();
    if (!permissions[req.workspaceRole]?.includes(permission)) {
      return res.status(403).json({ message: 'Your workspace role does not allow this action' });
    }
    next();
  };
}

export function canManageMember(actorRole, targetRole, nextRole) {
  if (actorRole === 'owner') return targetRole !== 'owner' && nextRole !== 'owner';
  if (actorRole === 'admin') return ['member', 'viewer', 'approver', 'budget_manager'].includes(targetRole) && ['member', 'viewer', 'approver', 'budget_manager'].includes(nextRole);
  return false;
}
