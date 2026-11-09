import { Router } from 'express';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import auth from '../middleware/auth.js';
import workspaceContext, { workspaceFilter, tenantFilter } from '../middleware/workspaceContext.js';
const router=Router();router.use(auth, workspaceContext);
router.get('/',async(req,res,next)=>{try{
 const q=tenantFilter(req);if(req.query.budget)q.budget=req.query.budget;if(req.query.category)q.category=req.query.category;
 if(req.query.search)q.title={$regex:String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),$options:'i'};
 const rows=await Expense.find(q).populate('budget','title').sort({date:-1}).lean();res.json(rows);
}catch(e){next(e)}});
router.post('/',async(req,res,next)=>{try{
 const {budget,title,category,amount,date,description}=req.body;
 if(!budget||!title?.trim()||!category?.trim()||!Number.isFinite(Number(amount))||Number(amount)<=0)return res.status(400).json({message:'Budget, title, category and a positive amount are required'});
 const owned=await Budget.findOne({_id:budget,...tenantFilter(req)});if(!owned)return res.status(400).json({message:'Select a valid budget'});
 const row=await Expense.create({user:req.userId,...(req.workspaceId?{workspace:req.workspaceId}:{}),budget,title,category,amount:Number(amount),date:date||new Date(),description});res.status(201).json(row);
}catch(e){next(e)}});
router.put('/:id',async(req,res,next)=>{try{
 const row=await Expense.findOne({_id:req.params.id,...tenantFilter(req)});if(!row)return res.status(404).json({message:'Expense not found'});
 for(const k of ['title','category','description','date'])if(req.body[k]!==undefined)row[k]=req.body[k];
 if(req.body.amount!==undefined){const n=Number(req.body.amount);if(!Number.isFinite(n)||n<=0)return res.status(400).json({message:'Amount must be greater than zero'});row.amount=n;}
 if(req.body.budget!==undefined){const b=await Budget.findOne({_id:req.body.budget,...tenantFilter(req)});if(!b)return res.status(400).json({message:'Select a valid budget'});row.budget=b._id;}
 await row.save();res.json(row);
}catch(e){next(e)}});
router.delete('/:id',async(req,res,next)=>{try{const row=await Expense.findOneAndDelete({_id:req.params.id,...tenantFilter(req)});if(!row)return res.status(404).json({message:'Expense not found'});res.json({message:'Expense deleted'});}catch(e){next(e)}});
export default router;
