import { Router } from 'express';
import mongoose from 'mongoose';
import crypto from 'node:crypto';
import auth from '../middleware/auth.js';
import workspaceContext, { canManageMember } from '../middleware/workspaceContext.js';
import Workspace from '../models/Workspace.js';
import WorkspaceInvitation from '../models/WorkspaceInvitation.js';
import User from '../models/User.js';
import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';

const router = Router();
router.use(auth);

async function ensurePersonalWorkspace(userId) {
  let workspace = await Workspace.findOne({ type: 'personal', owner: userId, status: 'active' });
  if (!workspace) {
    workspace = await Workspace.create({ name: 'Personal workspace', type: 'personal', owner: userId, members: [{ user: userId, role: 'owner' }] });
  }
  await Promise.all([
    Budget.updateMany({ user: userId, workspace: { $exists: false } }, { $set: { workspace: workspace._id } }),
    Expense.updateMany({ user: userId, workspace: { $exists: false } }, { $set: { workspace: workspace._id } })
  ]);
  return workspace;
}

router.get('/', async (req, res, next) => {
  try {
    await ensurePersonalWorkspace(req.userId);
    const workspaces = await Workspace.find({ 'members.user': req.userId, status: 'active' }).sort({ type: 1, updatedAt: -1 }).select('name type owner members currency createdAt').lean();
    res.json({ workspaces: workspaces.map(w => {
      const member = w.members.find(m => String(m.user) === String(req.userId));
      return { id: String(w._id), name: w.name, type: w.type, role: member?.role || 'member', currency: w.currency, createdAt: w.createdAt };
    }) });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    if (name.length < 2 || name.length > 100) return res.status(400).json({ message: 'Workspace name must be between 2 and 100 characters' });
    if (req.body.type !== 'organization') return res.status(400).json({ message: 'Only organization workspaces can be created here' });
    const currency = String(req.body.currency || 'INR').toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) return res.status(400).json({ message: 'Currency must be a three-letter ISO code' });
    const workspace = await Workspace.create({ name, type: 'organization', owner: req.userId, currency, members: [{ user: req.userId, role: 'owner' }] });
    res.status(201).json({ workspace: { id: String(workspace._id), name: workspace.name, type: workspace.type, role: 'owner', currency: workspace.currency } });
  } catch (error) { next(error); }
});

router.post('/:id/accept-invitation', async (req, res, next) => {
  try {
    const token = String(req.body.token || '');
    if (!/^[a-f0-9]{64}$/i.test(token)) return res.status(400).json({ message: 'Invalid invitation token' });
    const user = await User.findById(req.userId).select('email');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const invitation = await WorkspaceInvitation.findOne({ workspace: req.params.id, email: user.email, tokenHash, acceptedAt: null, revokedAt: null, expiresAt: { $gt: new Date() } }).select('+tokenHash');
    if (!invitation) return res.status(404).json({ message: 'Invitation is invalid, expired, revoked, or belongs to another email' });
    const workspace = await Workspace.findOneAndUpdate({ _id: req.params.id, status: 'active', 'members.user': { $ne: req.userId } }, { $push: { members: { user: req.userId, role: invitation.role } } }, { new: true });
    if (!workspace) return res.status(409).json({ message: 'You are already a member or the workspace is unavailable' });
    invitation.acceptedAt = new Date();
    await invitation.save();
    res.json({ message: 'Invitation accepted', workspace: { id: String(workspace._id), name: workspace.name, role: invitation.role } });
  } catch (e) { next(e); }
});

router.use('/:id', workspaceContext);
router.get('/:id/members', async (req, res, next) => {
  try {
    if (String(req.workspaceId) !== req.params.id) return res.status(400).json({ message: 'Select this workspace to manage its members' });
    const workspace = await Workspace.findById(req.params.id).populate('members.user', 'name email').lean();
    res.json({ members: workspace.members.map(m => ({ userId: String(m.user._id), name: m.user.name, email: m.user.email, role: m.role, joinedAt: m.joinedAt })) });
  } catch (e) { next(e); }
});

router.post('/:id/invitations', async (req, res, next) => {
  try {
    if (String(req.workspaceId) !== req.params.id) return res.status(400).json({ message: 'Select this workspace before inviting members' });
    if (!['owner', 'admin'].includes(req.workspaceRole)) return res.status(403).json({ message: 'Only workspace owners and admins can invite members' });
    const email = String(req.body.email || '').trim().toLowerCase();
    const role = String(req.body.role || 'member');
    const allowed = req.workspaceRole === 'owner' ? ['admin', 'budget_manager', 'approver', 'member', 'viewer'] : ['budget_manager', 'approver', 'member', 'viewer'];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address' });
    if (!allowed.includes(role)) return res.status(403).json({ message: 'You cannot assign that role' });
    const target = await User.findOne({ email }).select('_id');
    if (target && (await Workspace.exists({ _id: req.params.id, 'members.user': target._id }))) return res.status(409).json({ message: 'This user is already a workspace member' });
    await WorkspaceInvitation.updateMany({ workspace: req.params.id, email, acceptedAt: null, revokedAt: null }, { $set: { revokedAt: new Date() } });
    const token = crypto.randomBytes(32).toString('hex');
    const invitation = await WorkspaceInvitation.create({
      workspace: req.params.id, email, role,
      tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
      invitedBy: req.userId, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    res.status(201).json({ invitation: { id: String(invitation._id), email, role, expiresAt: invitation.expiresAt }, inviteToken: token, delivery: 'manual' });
  } catch (e) { next(e); }
});

router.get('/:id/invitations', async (req, res, next) => {
  try {
    if (!['owner', 'admin'].includes(req.workspaceRole)) return res.status(403).json({ message: 'Only owners and admins can view invitations' });
    const invitations = await WorkspaceInvitation.find({ workspace: req.params.id, acceptedAt: null, revokedAt: null, expiresAt: { $gt: new Date() } }).select('email role expiresAt createdAt').sort({ createdAt: -1 }).lean();
    res.json({ invitations });
  } catch (e) { next(e); }
});

router.delete('/:id/invitations/:invitationId', async (req, res, next) => {
  try {
    if (!['owner', 'admin'].includes(req.workspaceRole)) return res.status(403).json({ message: 'Only owners and admins can revoke invitations' });
    const invitation = await WorkspaceInvitation.findOneAndUpdate({ _id: req.params.invitationId, workspace: req.params.id, acceptedAt: null, revokedAt: null }, { $set: { revokedAt: new Date() } }, { new: true });
    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });
    res.json({ message: 'Invitation revoked' });
  } catch (e) { next(e); }
});

router.patch('/:id/members/:userId', async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    const member = workspace.members.find(m => String(m.user) === req.params.userId);
    const nextRole = String(req.body.role || '');
    if (!member || !canManageMember(req.workspaceRole, member.role, nextRole)) return res.status(403).json({ message: 'You cannot change this member role' });
    if (!['admin', 'budget_manager', 'approver', 'member', 'viewer'].includes(nextRole)) return res.status(400).json({ message: 'Invalid member role' });
    member.role = nextRole;
    await workspace.save();
    res.json({ message: 'Member role updated', userId: req.params.userId, role: nextRole });
  } catch (e) { next(e); }
});

router.delete('/:id/members/:userId', async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    const member = workspace.members.find(m => String(m.user) === req.params.userId);
    if (!member || !canManageMember(req.workspaceRole, member.role, 'viewer')) return res.status(403).json({ message: 'You cannot remove this member' });
    workspace.members = workspace.members.filter(m => String(m.user) !== req.params.userId);
    await workspace.save();
    res.json({ message: 'Member removed from workspace' });
  } catch (e) { next(e); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const workspace = await Workspace.findOne({ _id: req.params.id, owner: req.userId, status: 'active' });
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (name.length < 2 || name.length > 100) return res.status(400).json({ message: 'Workspace name must be between 2 and 100 characters' });
      workspace.name = name;
    }
    if (req.body.currency !== undefined) {
      const currency = String(req.body.currency).toUpperCase();
      if (!/^[A-Z]{3}$/.test(currency)) return res.status(400).json({ message: 'Currency must be a three-letter ISO code' });
      workspace.currency = currency;
    }
    await workspace.save();
    res.json({ workspace: { id: String(workspace._id), name: workspace.name, type: workspace.type, role: req.workspaceRole, currency: workspace.currency } });
  } catch (e) { next(e); }
});



export default router;
