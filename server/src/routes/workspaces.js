import { Router } from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import Workspace from '../models/Workspace.js';
import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';

const router = Router();
router.use(auth);

async function ensurePersonalWorkspace(userId) {
  let workspace = await Workspace.findOne({ type: 'personal', owner: userId, status: 'active' });
  if (!workspace) {
    workspace = await Workspace.create({
      name: 'Personal workspace',
      type: 'personal',
      owner: userId,
      members: [{ user: userId, role: 'owner' }]
    });
  }
  // One-time, idempotent adoption of legacy records. Existing documents and IDs
  // remain intact; only the workspace reference is added.
  await Promise.all([
    Budget.updateMany({ user: userId, workspace: { $exists: false } }, { $set: { workspace: workspace._id } }),
    Expense.updateMany({ user: userId, workspace: { $exists: false } }, { $set: { workspace: workspace._id } })
  ]);
  return workspace;
}

router.get('/', async (req, res, next) => {
  try {
    await ensurePersonalWorkspace(req.userId);
    const workspaces = await Workspace.find({ 'members.user': req.userId, status: 'active' })
      .sort({ type: 1, updatedAt: -1 }).select('name type owner members currency createdAt updatedAt').lean();
    res.json({ workspaces: workspaces.map(w => {
      const member = w.members.find(m => String(m.user) === String(req.userId));
      return { id: String(w._id), name: w.name, type: w.type, role: member?.role || 'member', currency: w.currency, createdAt: w.createdAt };
    }) });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const type = req.body.type;
    if (name.length < 2 || name.length > 100) return res.status(400).json({ message: 'Workspace name must be between 2 and 100 characters' });
    if (!['personal', 'organization'].includes(type)) return res.status(400).json({ message: 'Workspace type must be personal or organization' });
    if (type === 'personal') return res.status(409).json({ message: 'Your personal workspace is created automatically' });
    const workspace = await Workspace.create({
      name, type, owner: req.userId,
      currency: String(req.body.currency || 'INR').toUpperCase(),
      members: [{ user: req.userId, role: 'owner' }]
    });
    res.status(201).json({ workspace: { id: String(workspace._id), name: workspace.name, type: workspace.type, role: 'owner', currency: workspace.currency } });
  } catch (error) { next(error); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid workspace ID' });
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
    res.json({ workspace: { id: String(workspace._id), name: workspace.name, type: workspace.type, role: 'owner', currency: workspace.currency } });
  } catch (error) { next(error); }
});

export default router;
