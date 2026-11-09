import { Router } from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import workspaceContext from '../middleware/workspaceContext.js';
import Budget from '../models/Budget.js';
import BudgetApproval from '../models/BudgetApproval.js';

const router = Router();
router.use(auth, workspaceContext);

const reviewers = ['owner', 'admin', 'budget_manager', 'approver'];
const canReview = req => Boolean(req.workspaceId && reviewers.includes(req.workspaceRole));

router.get('/', async (req, res, next) => {
  try {
    if (!req.workspaceId) return res.status(400).json({ message: 'Select a workspace to view approvals' });
    const filter = { workspace: req.workspaceId };
    if (!canReview(req)) filter.requestedBy = req.userId;
    const approvals = await BudgetApproval.find(filter)
      .populate('requestedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ status: 1, createdAt: -1 }).lean();
    res.json({ approvals });
  } catch (error) { next(error); }
});

router.post('/budgets/:budgetId/submit', async (req, res, next) => {
  try {
    if (!req.workspaceId) return res.status(400).json({ message: 'Select a workspace before submitting for approval' });
    if (!['owner', 'admin', 'budget_manager', 'member'].includes(req.workspaceRole)) return res.status(403).json({ message: 'Your role cannot submit budget requests' });
    if (!mongoose.isValidObjectId(req.params.budgetId)) return res.status(400).json({ message: 'Invalid budget' });
    const budget = await Budget.findOne({ _id: req.params.budgetId, workspace: req.workspaceId });
    if (!budget) return res.status(404).json({ message: 'Budget not found in this workspace' });
    const pending = await BudgetApproval.findOne({ budget: budget._id, status: 'pending' });
    if (pending) return res.status(409).json({ message: 'This budget already has a pending approval request' });
    const approval = await BudgetApproval.create({
      workspace: req.workspaceId, budget: budget._id, requestedBy: req.userId,
      title: budget.title, department: budget.department,
      allocatedAmount: budget.allocatedAmount, period: budget.period,
      history: [{ action: 'submitted', actor: req.userId, comment: String(req.body.comment || '').trim().slice(0, 1000) }]
    });
    res.status(201).json({ approval });
  } catch (error) { next(error); }
});

router.post('/:id/decision', async (req, res, next) => {
  try {
    if (!req.workspaceId) return res.status(400).json({ message: 'Select a workspace to review requests' });
    if (!canReview(req)) return res.status(403).json({ message: 'Your role cannot review budget requests' });
    const decision = String(req.body.decision || '');
    const comment = String(req.body.comment || '').trim();
    if (!['approved', 'rejected'].includes(decision)) return res.status(400).json({ message: 'Decision must be approved or rejected' });
    if (!comment) return res.status(400).json({ message: 'A review comment is required' });
    const request = await BudgetApproval.findOne({ _id: req.params.id, workspace: req.workspaceId, status: 'pending' });
    if (!request) return res.status(404).json({ message: 'Pending approval request not found' });
    if (String(request.requestedBy) === String(req.userId)) return res.status(403).json({ message: 'You cannot approve or reject your own request' });
    const budget = await Budget.findOne({ _id: request.budget, workspace: req.workspaceId });
    if (!budget) return res.status(409).json({ message: 'The linked budget no longer exists' });
    if (decision === 'approved') {
      budget.title = request.title;
      budget.department = request.department;
      budget.allocatedAmount = request.allocatedAmount;
      budget.period = request.period;
      await budget.save();
    }
    request.status = decision;
    request.reviewedBy = req.userId;
    request.reviewedAt = new Date();
    request.reviewComment = comment;
    request.history.push({ action: decision, actor: req.userId, comment });
    await request.save();
    res.json({ message: 'Budget request ' + decision, approval: request });
  } catch (error) { next(error); }
});

export default router;
