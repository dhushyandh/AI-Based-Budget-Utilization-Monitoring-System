import { Router } from 'express';
import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import auth from '../middleware/auth.js';
import workspaceContext, { workspaceFilter } from '../middleware/workspaceContext.js';
import mongoose from 'mongoose';
const router=Router(); router.use(auth, workspaceContext);
router.get('/',async(req,res,next)=>{try{
 const budgets=await Budget.find({user:req.userId,...workspaceFilter(req)}).sort({createdAt:-1}).lean();
 const totals=await Expense.aggregate([{$match:{user:new mongoose.Types.ObjectId(req.userId),...(req.workspaceId?{workspace:req.workspaceId}:{})}},{$group:{_id:'$budget',spent:{$sum:'$amount'}}}]);
 const map=new Map(totals.map(x=>[String(x._id),x.spent]));
 res.json(budgets.map(b=>({...b,spent:map.get(String(b._id))||0,remaining:b.allocatedAmount-(map.get(String(b._id))||0)})));
}catch(e){next(e)}});
router.post('/',async(req,res,next)=>{try{
 const {title,department,allocatedAmount,period,startDate}=req.body;
 if(!title?.trim()||!Number.isFinite(Number(allocatedAmount))||Number(allocatedAmount)<=0)return res.status(400).json({message:'Enter a title and an allocated amount greater than zero'});
 const b=await Budget.create({user:req.userId,...(req.workspaceId?{workspace:req.workspaceId}:{}),title,department,allocatedAmount:Number(allocatedAmount),period,startDate});res.status(201).json(b);
}catch(e){next(e)}});
router.put('/:id',async(req,res,next)=>{try{
 const b=await Budget.findOne({ _id:req.params.id,user:req.userId,...workspaceFilter(req) });if(!b)return res.status(404).json({message:'Budget not found'});
 if(req.body.title!==undefined)b.title=req.body.title;
 if(req.body.department!==undefined)b.department=req.body.department;
 if(req.body.period!==undefined)b.period=req.body.period;
 if(req.body.allocatedAmount!==undefined){const n=Number(req.body.allocatedAmount);if(!Number.isFinite(n)||n<=0)return res.status(400).json({message:'Allocated amount must be greater than zero'});b.allocatedAmount=n;}
 await b.save();res.json(b);
}catch(e){next(e)}});
router.delete('/:id',async(req,res,next)=>{try{
 const b=await Budget.findOne({_id:req.params.id,user:req.userId,...workspaceFilter(req)});if(!b)return res.status(404).json({message:'Budget not found'});
 await Expense.deleteMany({budget:b._id,user:req.userId,...workspaceFilter(req)});await b.deleteOne();res.json({message:'Budget and its expenses deleted'});
}catch(e){next(e)}});
export default router;
