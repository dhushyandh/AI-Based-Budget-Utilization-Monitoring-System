import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
const router = Router();
const issue = user => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
router.post('/register', async (req,res,next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({message:'Name, email and password are required'});
    if (password.length < 8) return res.status(400).json({message:'Password must contain at least 8 characters'});
    const normalized = email.toLowerCase().trim();
    if (await User.findOne({email:normalized})) return res.status(409).json({message:'An account with this email already exists'});
    const user = await User.create({name, email:normalized, passwordHash:await bcrypt.hash(password,12)});
    res.status(201).json({token:issue(user), user:{id:user._id,name:user.name,email:user.email}});
  } catch(e){next(e)}
});
router.post('/login', async (req,res,next) => {
  try {
    const user = await User.findOne({email:String(req.body.email||'').toLowerCase().trim()});
    if (!user || !(await bcrypt.compare(req.body.password||'',user.passwordHash))) return res.status(401).json({message:'Invalid email or password'});
    res.json({token:issue(user),user:{id:user._id,name:user.name,email:user.email}});
  } catch(e){next(e)}
});
router.get('/me',auth,async(req,res,next)=>{
  try { const u=await User.findById(req.userId).select('name email phone avatarUrl onboardingCompleted createdAt'); if(!u)return res.status(404).json({message:'User not found'}); res.json({user:{id:u._id,name:u.name,email:u.email,phone:u.phone,avatarUrl:u.avatarUrl,onboardingCompleted:u.onboardingCompleted,createdAt:u.createdAt}}); } catch(e){next(e)}
});
export default router;
